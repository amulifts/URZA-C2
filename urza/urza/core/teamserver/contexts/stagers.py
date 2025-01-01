import asyncio
from copy import deepcopy
from urza.core.events import Events
from urza.core.utils import CmdError, get_path_in_package
from urza.core.teamserver import ipc_server
from urza.core.teamserver.loader import Loader


class Stagers(Loader):
    name = 'stagers'
    description = 'Stagers menu'

    def __init__(self, teamserver):
        self.teamserver = teamserver
        self.selected = None

        ipc_server.attach(Events.GET_STAGERS, self._get_stagers)
        super().__init__(type="stager", paths=[get_path_in_package("core/teamserver/stagers/")])

    def _get_stagers(self, name):
        if name:
            try:
                return list(filter(lambda stager: stager.name == name, self.loaded))[0]
            except IndexError:
                return
        else:
            return self.loaded
        
    # -------------------------- 
    # Accept user=None as a default param:
    # -------------------------- 
    def list(self, user=None):
        """
        Get or list available stagers
        """
        # Return the "loaded" stagers to the client.
        return {s.name: dict(s) for s in self.loaded}

    def use(self, name: str, user=None):
        for s in self.loaded:
            if s.name.lower() == name.lower():
                self.selected = deepcopy(s)
                return dict(self.selected)

        raise CmdError(f"No stager available named '{name.lower()}'")

    def options(self, user=None):
        if not self.selected:
            raise CmdError("No stager selected")

        return self.selected.options

    def set(self, name: str, value: str, user=None):
        if not self.selected:
            raise CmdError("No stager selected")

        try:
            self.selected[name] = value
        except KeyError:
            raise CmdError(f"Unknown option '{name}'")

    def generate(self, listener_id, user=None):
        """
        Generates the selected stager, given a specific listener ID (instead of name).
        """
        if not self.selected:
            raise CmdError("No stager selected")

        for l in self.teamserver.contexts['listeners'].listeners:
            # if l['Name'] == listener_name:
            if l.listener_id == listener_id:
                guid, psk, generated_stager = self.selected.generate(l)

                # Register the new guid with sessions so the teamserver knows about it
                self.teamserver.contexts['sessions']._register(guid, psk)

                return {
                    "output": generated_stager,
                    "suggestions": self.selected.suggestions,
                    "extension": self.selected.extension
                }

        # raise CmdError(f"No listener running with name '{listener_name}'")
        raise CmdError(f"No listener running with ID '{listener_id}'")

    def get_selected(self, user=None):
        if self.selected:
            return dict(self.selected)
        return "No stager selected!"

    def reload(self, user=None):
        self.get_loadables()
        if self.selected:
            self.use(self.selected.name)

        asyncio.create_task(
            self.teamserver.update_available_loadables()
        )

    def __str__(self):
        return self.__class__.__name__.lower()

    def __iter__(self):
        yield ('loaded', len(self.loaded))
