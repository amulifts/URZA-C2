# django-urza-backend/backend/apps/st_client/api.py

from ninja import Router
from ninja.errors import HttpError
import logging
from .schemas import ConnectRequest, PidResponse
from .process_manager import ProcessManager
from rest_framework_simplejwt.authentication import JWTAuthentication
from ninja.security import HttpBearer

logger = logging.getLogger(__name__)

st_client_router = Router()

# Custom JWT authentication using Django REST Framework's JWTAuthentication
class JWTAuth(HttpBearer):
    def authenticate(self, request, token):
        try:
            user, _ = JWTAuthentication().authenticate(request)
            return user
        except Exception as e:
            logger.error(f"Authentication failed: {e}")
            return None

auth = JWTAuth()

@st_client_router.post("/connect/", response=PidResponse, auth=auth)
def connect(request, payload: ConnectRequest):
    """
    Initiate a connection to the TeamServer. Only Admin can do this.
    """
    user = request.auth
    if not user or (not hasattr(user, 'profile')) or user.profile.role != "Admin":
        raise HttpError(403, "Forbidden: Only Admins can initiate connections.")
    
    connection_url = str(payload.connection_url)
    logger.info(f"User {user.username} is initiating connection to {connection_url}")

    process_manager = ProcessManager()
    pid = process_manager.start_client(connection_url)
    return {"detail": "Connection initiated successfully.", "pid": pid}

@st_client_router.post("/disconnect/", auth=auth)
def disconnect(request):
    """
    Stop the currently running st_client process. Only Admin can do this.
    """
    user = request.auth
    if not user or (not hasattr(user, 'profile')) or user.profile.role != "Admin":
        raise HttpError(403, "Forbidden: Only Admins can stop the client.")

    process_manager = ProcessManager()
    try:
        process_manager.stop_client()
        return {"detail": "Client process stopped successfully."}
    except Exception as e:
        logger.exception("Failed to stop the client.")
        raise HttpError(500, "Internal Server Error: Unable to stop the client.")

