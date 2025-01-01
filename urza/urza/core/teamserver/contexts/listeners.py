import asyncio
import logging
import traceback
from copy import deepcopy
from urza.core.events import Events
from urza.core.teamserver import ipc_server
from urza.core.teamserver.loader import Loader
from urza.core.utils import CmdError, gen_random_string, get_path_in_package
import threading


class Listeners(Loader):
    name = 'listeners'
    description = 'Listener menu'

    def __init__(self, teamserver):
        self.teamserver = teamserver
        self.listeners = []
        self.selected = None
        # self.listener_thread = None  # Thread for the listener
        # Keep a dict of threads keyed by listener name
        self.listener_threads = {}

        ipc_server.attach(Events.GET_LISTENERS, self._get_listeners)
        super().__init__(type="listener", paths=[get_path_in_package("core/teamserver/listeners/")])

    def _get_listeners(self, name):
        if name:
            try:
                return list(filter(lambda l: l.name == name, self.listeners))[0]
            except IndexError:
                return
        else:
            return self.listeners

    def list(self, name: str, running: bool, available: bool, user=None):
        """
        Get running/available listeners

        Usage: list [-h] [(--running | --available)] [<name>]
        """

        if available:
            # Return name + port + an actual Description
            return {
                f"{l.name}-{l['Port']}": {
                    "Name":        l['Name'],
                    "Description": l.description
                }
                for l in self.loaded
            }
        else:
            # "running" listeners are in self.listeners
            running_listeners = {}
            for l in self.listeners:
                # e.g. key => "http-8009" 
                key = f"{l.name}-{l['Port']}"
                running_listeners[key] = {
                    "ID": l.listener_id, # <--- Must be l.listener_id
                    "Name": l['Name'],
                    "URL": f"{l['Name']}://{l['BindIP']}:{l['Port']}",
                    "CreatedBy": getattr(l, 'created_by', None)
                }
            return running_listeners

    def use(self, name: str, user=None):
        """
        Select the specified listener

        Usage: use <name> [-h]
        """
        for l in self.loaded:
            if l.name.lower() == name.lower():
                self.selected = deepcopy(l)
                #self.selected.name = f"{l.name}-{gen_random_string(6)}"
                return dict(self.selected)

        raise CmdError(f"No listener available named '{name.lower()}'")

    def options(self, user=None):
        if not self.selected:
            raise CmdError("No listener selected")
        return self.selected.options

    def start_listener_in_thread(self, listener_obj):
        """
        Starts the selected listener in a separate thread.
        """
        try:
            logging.debug(f"Starting listener in thread: {listener_obj}")
            
            # Create and set an asyncio event loop for the thread
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            # Run the listener's start logic
            listener_obj.start()
            
            loop.run_until_complete(loop.shutdown_asyncgens())
            loop.close()
        except Exception as e:
            logging.error(f"Error while starting listener in thread: {e}")
            traceback.print_exc()


    def start(self, user=None):
        """
        Start the currently selected listener.
        `user` = the user object who invoked this command
        """
        if not self.selected:
            raise CmdError("No listener selected")

        # # Make sure the 'Name' is not already used by a running listener
        # if any(l['Name'] == self.selected['Name'] for l in self.listeners):
        #     raise CmdError(f"A listener named '{self.selected['Name']}' is already running!")

        # 1) Grab the "Name" and "Port" from self.selected
        selected_name = self.selected['Name']  # e.g. "http"
        selected_port = self.selected['Port']  # e.g. 8009
        selected_ip   = self.selected['BindIP']  # e.g. "127.0.0.1"

        # Check if an existing listener has exactly the same IP and Port (regardless of name).
        for running_listener in self.listeners:
            running_ip   = running_listener['BindIP']
            running_port = running_listener['Port']
            
            # If IP + Port is the same, block it:
            if running_ip == selected_ip and running_port == selected_port:
                raise CmdError(
                    f"A listener is already running on {running_ip}:{running_port}!"
                )
        
        # **Generate a random ID** for this new listener
        if self.selected.listener_id is None:
            self.selected.listener_id = gen_random_string(8)

        # If we get here, that IP:Port is free, so let's proceed
        try:
            t = threading.Thread(
                target=self.start_listener_in_thread,
                args=(self.selected,),
                daemon=True
            )
            self.listener_threads[self.selected['Name']] = t
            t.start()

             # Record the username
            if user is not None:
                self.selected.created_by = user.name
            
            logging.info(f"Started {self.selected.name} listener ({self.selected['BindIP']}:{self.selected['Port']})")

        except Exception as e:
            logging.error(f"Failed to start {self.selected.name} listener: {e}")
            traceback.print_exc()
            raise CmdError(f"Failed to start {self.selected.name} listener: {e}")
        else:
            # Keep track of running listeners
            self.listeners.append(self.selected)
            # Immediately re-use the same selected to allow setting options
            self.use(self.selected.name)

            # 1) Immediately update server stats
            asyncio.create_task(self.teamserver.update_server_stats())

            # 2) BROADCAST THAT THIS USER STARTED A LISTENER
            if user is not None:
                msg = f"{user.name} started listener '{self.selected['Name']}'"
                logging.debug(msg)

                # Publish an event so the client’s event handler can display it
                asyncio.run_coroutine_threadsafe(
                    self.teamserver.users.broadcast_event(
                        Events.NEW_LISTENER,
                        msg  # the data is just the string we want to show
                    ),
                    loop=self.teamserver.loop
                )

            return dict(self.selected) # This dict now includes {'id': 'ABC123', ...}

    def stop(self, id: str, user=None):
        """
        Stops the specified listener by name, or the currently selected if none given.
        """
        # if not name:
        #     # If user typed just 'stop' but no name, use the selected listener's name
        #     if not self.selected:
        #         raise CmdError("No listener name provided and no listener selected!")
        #     # name = self.selected["Name"]
        #     name = self.selected.listener_id or self.selected["Name"]

        logging.debug(f"Attempting to stop listener: {id}")
        for listener in self.listeners:
         # Only match by listener_id
            if listener.listener_id == id:
                return self._actually_stop(listener)

        raise CmdError(f"Listener with ID '{id}' not found.")

    def _actually_stop(self, listener):
        """
        Actually stop the given listener object. 
        """
        try:
            # Call the stop() method on the actual listener object
            listener.stop()

            # Kill the thread if still running
            t = self.listener_threads.pop(listener['Name'], None)
            if t and t.is_alive():
                t.join(timeout=3)

            # Remove from the list of running listeners
            self.listeners.remove(listener)
            logging.info(f"Successfully stopped listener '{listener.listener_id}'")

            # <--- return the listener so the client can display a message
            return dict(listener)
        except Exception as e:
            logging.error(f"Failed to stop listener {listener.listener_id}: {e}")
            traceback.print_exc()
            return

    def set(self, name: str, value: str, user=None):
        if not self.selected:
            raise CmdError("No listener selected")

        try:
            self.selected[name] = value
        except KeyError:
            raise CmdError(f"Unknown option '{name}'")
    
    def get_selected(self):
        if self.selected:
            return dict(self.selected)
        return "No listener selected!"

    def reload(self, user=None):
        self.get_loadables()
        if self.selected:
            self.use(self.selected.name)

        asyncio.create_task(
            self.teamserver.update_available_loadables()
        )

    def __iter__(self):
        for listener in self.listeners:
            yield (listener.name, dict(listener))

    def __str__(self):
        return self.__class__.__name__.lower()

