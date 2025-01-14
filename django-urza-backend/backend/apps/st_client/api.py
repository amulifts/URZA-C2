# django-urza-backend/backend/apps/st_client/api.py

from ninja import Router
from ninja.errors import HttpError
import logging
from .schemas import ConnectRequest
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

@st_client_router.post("/connect/", auth=auth)
def connect(request, payload: ConnectRequest):
    """
    Initiate a connection to the TeamServer.
    Only Admin users can perform this action.
    """
    try:
        user = request.auth
        if not user:
            raise HttpError(401, "Unauthorized: Please log in.")
        
        # Check if the user has a profile and is an Admin
        if not hasattr(user, 'profile') or user.profile.role != "Admin":
            raise HttpError(403, "Forbidden: Only Admins can initiate connections.")
        
        # Convert connection_url to string to avoid type issues
        connection_url = str(payload.connection_url)
        logger.info(f"User {user.username} is initiating connection to {connection_url}")
        
        # Initialize the ProcessManager and start the client
        process_manager = ProcessManager()
        process_manager.start_client(connection_url)
        
        return {"detail": "Connection initiated successfully."}
    
    except HttpError as he:
        logger.error(f"HttpError: {he.detail}")
        raise he
    except Exception as e:
        logger.exception(f"Error connecting to TeamServer: {e}")
        raise HttpError(500, "Internal Server Error: Unable to connect to TeamServer.")
    
@st_client_router.post("/disconnect/", auth=auth)
def disconnect(request):
    """
    Disconnect the client from the TeamServer.
    Only Admin users can perform this action.
    """
    try:
        user = request.auth
        if not user:
            raise HttpError(401, "Unauthorized: Please log in.")
        
        # Check if the user has a profile and is an Admin
        if not hasattr(user, 'profile') or user.profile.role != "Admin":
            raise HttpError(403, "Forbidden: Only Admins can disconnect clients.")
        
        # Initialize the ProcessManager and stop the client
        process_manager = ProcessManager()
        process_manager.stop_client()
        
        return {"detail": "Client disconnected successfully."}
    
    except HttpError as he:
        logger.error(f"HttpError: {he.detail}")
        raise he
    except Exception as e:
        logger.exception(f"Error disconnecting client: {e}")
        raise HttpError(500, "Internal Server Error: Unable to disconnect client.")