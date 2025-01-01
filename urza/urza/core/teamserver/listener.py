from urza.core.ipcclient import IPCClient

class Listener(IPCClient):

    def __init__(self):
        super().__init__()
        self.name = ''
        self.author = ''
        self.description = ''
        self.options = {}

        # NEW: Track the user who created the listener
        self.created_by = None

        # New: a placeholder for a unique ID
        self.listener_id = None

    def __getitem__(self, key):
        for k,_ in self.options.items():
            if k.lower() == key.lower():
                return self.options[k]['Value']
            
        # For any extra attributes (like created_by), handle separately
        # If you want dict(...) to include them, see __iter__ method below

    def __setitem__(self, key, value):
        for k,_ in self.options.items():
            if k.lower() == key.lower():
                self.options[k]['Value'] = value

    def __iter__(self):
        # The existing iteration yields name/author/description/options/etc.
        yield ("id", self.listener_id)  # Expose the ID in dict(self)
        yield ("name", self.name)
        yield ("author", self.author)
        yield ("description", self.description)
        yield ("running", self.running)
        yield ("options", self.options)

        # NEW: also yield 'created_by'
        if self.created_by:
            yield ("created_by", self.created_by)