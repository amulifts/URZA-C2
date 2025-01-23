# urza/core/teamserver/__main__.py

#!/usr/bin/env python3

"""
Usage: teamserver [-h] [--port <PORT>] [--insecure] <host> <password>

optional arguments:
    -h, --help          Show this help message and exit
    -p, --port <PORT>   Port to bind to [default: 5000]
    --insecure          Start server without TLS
"""

import asyncio
import json
import logging
import os
import os.path
import ssl
import websockets
import signal
import http
import functools
import hmac
import traceback
from termcolor import colored
from base64 import b64decode
from websockets import WebSocketServerProtocol
from hashlib import sha512
from typing import Dict, List, Any
from urza.core.events import Events
from urza.core.teamserver.db import AsyncSTDatabase
from urza.core.teamserver.users import Users, UsernameAlreadyPresentError
from urza.core.teamserver.contexts import Listeners, Sessions, Modules, Stagers
from urza.core.utils import create_self_signed_cert, get_cert_fingerprint, decode_auth_header, \
    CmdError, get_ips, get_data_folder, get_path_in_data_folder

# ----- Added Logging Configuration Start -----

class JSONFormatter(logging.Formatter):
    """Custom formatter to output logs in JSON format."""
    def format(self, record):
        log_record = {
            'time': self.formatTime(record, self.datefmt),
            'level': record.levelname,
            'message': record.getMessage(),
            'name': record.name,
            'filename': record.filename,
            'lineno': record.lineno,
            'funcName': record.funcName,
        }
        # Include exception information if present
        if record.exc_info:
            log_record['exception'] = self.formatException(record.exc_info)
        return json.dumps(log_record)

def setup_logging():
    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG)  # Set root logger level

    # Determine the directory where __main__.py resides
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Set log directory to a 'logs' folder within the script's directory
    log_dir = os.path.join(script_dir, 'logs')
    os.makedirs(log_dir, exist_ok=True)

    # Add a debug statement to confirm log directory path
    logger.debug(f"Log directory set to: {log_dir}")

    # Console Handler for live logging
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.DEBUG)  # Set level for console
    console_formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s'
    )
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)

    # File Handler for JSON logs (append mode)
    json_log_path = os.path.join(log_dir, 'live_logs.json')
    try:
        file_handler = logging.FileHandler(json_log_path, mode='w', encoding='utf-8')  # Changed to 'a'
    except Exception as e:
        logger.error(f"Failed to create log file at {json_log_path}: {e}")
        raise
    file_handler.setLevel(logging.DEBUG)  # Set level for file
    file_formatter = JSONFormatter()
    file_handler.setFormatter(file_formatter)
    logger.addHandler(file_handler)
    
    # Add a debug statement to confirm file logging
    logger.debug(f"Logging to file: {json_log_path}")

# Call the logging setup function
setup_logging()

# ----- Added Logging Configuration End -----


class TeamServer:
    def __init__(self):
        self.users = Users()
        self.loop = asyncio.get_running_loop()
        self.contexts = {
            'listeners': Listeners(self),
            'sessions': Sessions(self),
            'modules': Modules(self),
            'stagers': Stagers(self),
            'users': self.users
        }

    async def process_client_message(self, user, path, data):
        message = json.loads(data)
        logging.debug(f"Received message from {user.name}@{user.ip} path:{path} msg: {message}")
        status = 'error'

        try:
            ctx = self.contexts[message['ctx'].lower()]
        except KeyError:
            traceback.print_exc()
            result = f"Context '{message['ctx'].lower()}' does not exist"
            logging.error(result)
        else:
            try:
                cmd_handler = getattr(ctx, message['cmd'])
                result = cmd_handler(**message['args'])
                status = 'success'
            except AttributeError:
                traceback.print_exc()
                result = f"Command '{message['cmd']}' does not exist in context '{message['ctx'].lower()}'"
            except CmdError as e:
                result = str(e)
            except Exception as e:
                traceback.print_exc()
                result = f"Exception when executing command '{message['cmd']}': {e}"
                logging.error(result)

        await user.send({
                'type': 'message',
                'id': message['id'],
                'ctx': message['ctx'],
                'name': message['cmd'],
                'status': status,
                'result': result
        })

    async def update_server_stats(self):
        stats = {**{str(ctx): dict(ctx) for ctx in self.contexts.values()}, 'ips': get_ips()} 
        await self.users.broadcast_event(Events.STATS_UPDATE, stats)

    async def update_available_loadables(self):
        loadables = {str(ctx): [loadable.name for loadable in ctx.loaded] for ctx in self.contexts.values() if hasattr(ctx, 'loaded')}
        await self.users.broadcast_event(Events.LOADABLES_UPDATE, loadables)

    async def connection_handler(self, websocket, path):
        try:
            user = await self.users.register(websocket)
            await self.update_server_stats()
            await self.update_available_loadables()
            logging.info(f"New client connected {user.name}@{user.ip}")
        except UsernameAlreadyPresentError as e:
            logging.error(f"{websocket.remote_address[0]}: {e}")
            return

        while True:
            try:
                data = await asyncio.wait_for(websocket.recv(), timeout=20)
            except asyncio.TimeoutError:
                # No data in 20 seconds, check the connection.
                logging.debug(f"No data from {user.name}@{user.ip} after 20 seconds, sending ping")
                try:
                    pong_waiter = await websocket.ping()
                    await asyncio.wait_for(pong_waiter, timeout=10)
                except asyncio.TimeoutError:
                    # No response to ping in 10 seconds, disconnect.
                    logging.debug(f"No pong from {user.name}@{user.ip} after 10 seconds, closing connection")
                    self.users.unregister(user.name)
                    await self.update_server_stats()
                    return

            except websockets.exceptions.ConnectionClosed:
                logging.debug(f"Connection closed by client")
                self.users.unregister(user.name)
                await self.update_server_stats()
                return
            else:
                await self.process_client_message(user, path, data)


class STWebSocketServerProtocol(WebSocketServerProtocol):
    teamserver_digest = None

    async def process_request(self, path, request_headers):
        if path.startswith('/api'):
            logging.debug(f"API request received: {path}, passing to Quart")
            # Bypass WebSocket handshake; let Quart handle the request
            return None  # Let Quart handle the request
        try:
            username, password_digest = decode_auth_header(request_headers)
            if not hmac.compare_digest(password_digest, STWebSocketServerProtocol.teamserver_digest):
                logging.error(f"User {username} failed authentication")
                return http.HTTPStatus.UNAUTHORIZED, [], b'UNAUTHORIZED\n'
        except KeyError:
            logging.error('Received handshake with no authorization header')
            return http.HTTPStatus.FORBIDDEN, [], b'FORBIDDEN\n'

        logging.info(f"User {username} authenticated successfully")


async def server(stop, args, teamserver_digest):
    if not os.path.exists(get_path_in_data_folder("st.db")):
        logging.info('Creating database')
        await AsyncSTDatabase.create_db_and_schema()

    ts = TeamServer()

    ssl_context = None
    if not args['--insecure']:
        ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        try:
            ssl_context.load_cert_chain(
                get_path_in_data_folder("chain.pem")
            )
        except FileNotFoundError:
            create_self_signed_cert()
            ssl_context.load_cert_chain(
                get_path_in_data_folder("chain.pem")
            )

        server_cert_fingerprint = get_cert_fingerprint(get_path_in_data_folder("cert.pem"))
        logging.warning(
            (f"{colored('Teamserver certificate fingerprint:', 'yellow')} "
             f"{colored(server_cert_fingerprint.hex(), 'red')}")
        )

    STWebSocketServerProtocol.teamserver_digest = teamserver_digest
    async with websockets.serve(
        ts.connection_handler,
        host=args['<host>'],
        port=int(args['--port']),
        create_protocol=STWebSocketServerProtocol,
        ssl=ssl_context,
        ping_interval=None,
        ping_timeout=None
    ):

        logging.info(colored(f"Teamserver started on {args['<host>']}:{args['--port']}", "yellow"))

        await stop

def start(args):
    if not os.path.exists(get_data_folder()):
        logging.info("First time use detected, creating data folder (~/.st)")
        os.makedirs(get_path_in_data_folder('logs'))
    if not os.path.exists(get_path_in_data_folder('logs')):
        os.mkdir(get_path_in_data_folder('logs'))

    loop = asyncio.get_event_loop()
    teamserver_digest = hmac.new(args['<password>'].encode(), msg=b'urza', digestmod=sha512).hexdigest()

    stop = asyncio.Future()
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, stop.set_result, None)

    if args['--insecure']:
        logging.warning('SECURITY WARNING: --insecure flag passed, communication between client and server will be in cleartext!')

    loop.run_until_complete(server(stop, args, teamserver_digest))
