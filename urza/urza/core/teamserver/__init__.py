import logging
import multiprocessing
from urza.core.ipcserver import IPCServer
logging.basicConfig(
    format="%(asctime)s %(process)d %(threadName)s - [%(levelname)s] %(filename)s: %(funcName)s - %(message)s",
    level=logging.DEBUG
)

# disable all loggers from different files
#logging.getLogger('asyncio').setLevel(logging.ERROR)
#logging.getLogger('asyncio.coroutines').setLevel(logging.ERROR)
logging.getLogger('websockets.server').setLevel(logging.ERROR)
logging.getLogger('websockets.protocol').setLevel(logging.ERROR)

# multiprocessing.set_start_method("fork")

# Use 'spawn' start method for Windows compatibility
if multiprocessing.get_start_method() != "spawn":
    multiprocessing.set_start_method("spawn", force=True)

ipc_server = IPCServer()
ipc_server.start()
