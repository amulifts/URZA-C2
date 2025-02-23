# urza/core/events.py

import enum

class Events(enum.Enum):
    NEW_SESSION = 1
    KEX = 2
    ENCRYPT_STAGE = 3
    USER_LOGIN = 4
    STATS_UPDATE = 5
    LOADABLES_UPDATE = 6
    NEW_JOB = 7
    SESSION_REGISTER = 8
    SESSION_STAGED = 9
    SESSION_CHECKIN = 10
    NEW_LISTENER = 11
    JOB_RESULT = 12
    GET_LISTENERS = 13
    GET_STAGERS = 14
    HOST_FILE = 15
    EXCEPTION = 16
