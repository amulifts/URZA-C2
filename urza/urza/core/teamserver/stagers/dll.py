# urza\urza\core\teamserver\stagers\dll.py

import uuid
from urza.core.teamserver.crypto import gen_stager_psk
from urza.core.teamserver.stager import Stager
from urza.core.utils import get_path_in_package


class STStager(Stager):
    def __init__(self):
        self.name = 'dll'
        self.description = 'Generates a windows dll stager'
        self.suggestions = ''
        self.extension = 'dll'
        self.author = '@byt3bl33d3r'
        self.options = {}

    def generate(self, listener):
        with open(get_path_in_package('core/teamserver/data/naga.dll'), 'rb') as dll:
            guid = uuid.uuid4()
            psk = gen_stager_psk()

            return guid, psk, dll.read().decode('latin-1')
