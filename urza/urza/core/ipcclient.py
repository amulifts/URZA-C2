import logging
import sys
import traceback
from urza.core.events import Events
from urza.core.teamserver import ipc_server
from collections import defaultdict
from multiprocessing import Process, Pipe
from multiprocessing.connection import Client
import threading
import asyncio


class IPCException(Exception):
    pass


class IPCClient:

    def __init__(self):
        self.subscribers = defaultdict(set)
        self.conn = None
        self.thread = None

    @property
    def running(self):
        if self.thread:
            return self.thread.is_alive()
        return False

    def run(self):
        return

    def start_in_thread(self):
        """
        Starts the IPC client in a separate thread with a proper asyncio event loop.
        """
        try:
            # Create and set an event loop for this thread
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            self.conn = Client(ipc_server.address, authkey=ipc_server.authkey)
            self.run()

            # Close the loop when finished
            loop.run_until_complete(loop.shutdown_asyncgens())
            loop.close()
        except Exception:
            if self.conn:
                self.conn.close()
            logging.error("".join(traceback.format_exception(*sys.exc_info())))

    def attach(self, event, func):
        self.subscribers[event].add(func)

    def start(self):
        self.thread = threading.Thread(target=self.start_in_thread, daemon=True)
        self.thread.start()

    def dispatch_event(self, event, msg):
        self.conn.send((event, msg))
        try:
            topic, data = self.conn.recv()
            if topic == Events.EXCEPTION:
                logging.debug(f"Received data back from event: {event} - ERROR - {data}")
                raise Exception(data)

            logging.debug(f"Received data back from event: {event} - OK")
            return data
        except EOFError:
            pass

    def stop(self):
        if self.thread and self.thread.is_alive():
            logging.debug(f"Stopping thread: {self.thread.name}")
