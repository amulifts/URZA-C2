import asyncio
import logging
from terminaltables import SingleTable
from urza.core.client.utils import command, register_cli_commands
from urza.core.utils import print_good, print_info, print_bad


@register_cli_commands
class Listeners:
    name = 'listeners'
    description = 'Listeners menu'

    _remote = True

    def __init__(self):
        self.prompt = None
        self.available = []
        self._selected = None

    @property
    def selected(self):
        return self._selected

    @selected.setter
    def selected(self, data):
        self.prompt = f"(<ansired>{data['name']}</ansired>)"
        self._selected = data

    @command
    def use(self, name: str, response):
        """
        Select the specified listener

        Usage: use <name> [-h]

        Arguments:
            name  filter by listener name
        """

        self.selected = response.result

    @command
    def list(self, name: str, running: bool, available: bool, response=None):
        """
        Get running/available listeners

        Usage: list [-h] [(--running | --available)] [<name>]

        Arguments:
            name  filter by listener name

        Options:
            -h, --help       Show dis
            -r, --running    List running listeners  [default: True]
            -a, --available  List available listeners
        """

        listeners = response.result # This is the dict the server returned
        table_data = []
        table_title = ""

        if available:        
            table_title = "Available"
            # Show only Name + Description
            table_data = [["Name", "Description"]]
            for key, info in listeners.items():
                table_data.append([
                    info.get("Name", "?"),
                    info.get("Description", "?")
                ])
                
        elif running:
            table_title = "Running"
            table_data = [["ID", "Name", "URL", "CreatedBy"]]
            for key, info in listeners.items():
                # info is like {"ID": "...", "Name": "...", "URL": "...", "CreatedBy": "..."}
                table_data.append([
                    info.get("ID", "?"),
                    info.get("Name", "?"),
                    info.get("URL", "?"),
                    info.get("CreatedBy", "?")
                ])
        else:
            # If user typed just `list` with no flags, let's assume 'running'
            table_title = "Running"
            table_data = [["ID", "Name", "URL", "CreatedBy"]]
            for key, info in listeners.items():
                # info is like {"ID": "...", "Name": "...", "URL": "...", "CreatedBy": "..."}
                table_data.append([
                    info.get("ID", "?"),
                    info.get("Name", "?"),
                    info.get("URL", "?"),
                    info.get("CreatedBy", "?")
                ])

        table = SingleTable(table_data)
        table.title = table_title
        table.inner_row_border = True
        print(table.table)

    @command
    def options(self, response):
        """
        Show selected listeners options

        Usage: options [-h]
        """

        table_data = [
            ["Option Name", "Required", "Value", "Description"]
        ]

        for k, v in response.result.items():
            table_data.append([k, v["Required"], v["Value"], v["Description"]])

        table = SingleTable(table_data, title="Listener Options")
        table.inner_row_border = True
        print(table.table)

    @command
    def start(self, response):
       """
       Start the selected listener

       Usage: start [-h]
       """
       listener = response.result
       print_good(f"Started listener \'{listener['options']['Name']['Value']}\'")

    @command
    def stop(self, id: str, response=None):
        """
        Stop the specified listener by ID.

        Usage: stop <id> [-h]

        Arguments:
            id   The unique ID of the listener you want to stop.

        Example:
            stop AB1QMD2Q
        """
        if not response or not response.result:
            print_bad("No valid response from server.")
            return

        stopped_listener = response.result
        
        # Fix: Provide a fallback if "Name" is not in the dictionary
        stopped_name = stopped_listener.get("Name", None)
        if stopped_name:
            print_info(f"Stopped listener '{stopped_name}' (ID: {id})")
        else:
            # If the server returns something else, we can do:
            print_info(f"Stopped a listener with ID '{id}', no 'Name' in server response.")

    @command
    def set(self, name: str, value: str, response):
        """
        Set options on the selected listener

        Usage: set <name> <value> [-h]

        Arguments:
            name   option name
            value  option value
        """

    @command
    def reload(self, response):
        """
        Reload all listeners

        Usage: reload [-h]
        """