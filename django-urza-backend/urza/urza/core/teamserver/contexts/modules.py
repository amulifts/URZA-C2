# urza\urza\core\teamserver\contexts\modules.py

import types
import asyncio
#from copy import deepcopy
from urza.core.events import Events
from urza.core.teamserver import ipc_server
from urza.core.teamserver.loader import Loader
from urza.core.utils import CmdError, get_path_in_package
from urza.core.teamserver.job import Job


class Modules(Loader):
    name = 'modules'
    description = 'Modules menu'

    def __init__(self, teamserver):
        self.teamserver = teamserver
        self.modules = []
        self.selected = None
        super().__init__(type="module", paths=[get_path_in_package("core/teamserver/modules/boo/")])

    def list(self, name: str = None, user=None):
        return {m.name: m.description for m in self.loaded}

    def use(self, name: str, user=None):
        for m in self.loaded:
            if m.name.lower() == name.lower():
                #self.selected = deepcopy(m)
                self.selected = m
                return dict(self.selected)

        raise CmdError(f"No module available named '{name.lower()}'")

    def options(self, user=None):
        if not self.selected:
            raise CmdError("No module selected")
        return self.selected.options

    def info(self, user=None):
        if not self.selected:
            raise CmdError("No module selected")
        return dict(self.selected)

    def set(self, name: str, value: str, user=None):
        if not self.selected:
            raise CmdError("No module selected")

        try:
            self.selected[name] = value
        except KeyError:
            raise CmdError(f"Unknown option '{name}'")

    def run(self, guids, user=None):
        for guid in guids:
            ipc_server.publish_event(Events.NEW_JOB, (guid, Job(module=self.selected)))

    def reload(self, user=None):
        self.get_loadables()
        if self.selected:
            self.use(self.selected.name)

        asyncio.create_task(
            self.teamserver.update_available_loadables()
        )

    def get_selected(self, user=None):
        if self.selected:
            return dict(self.selected)

    def __iter__(self):
        yield ('loaded', len(self.loaded))

    def __str__(self):
        return self.__class__.__name__.lower()