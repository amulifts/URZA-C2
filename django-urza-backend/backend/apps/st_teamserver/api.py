# django-urza-backend/backend/apps/st_teamserver/api.py

from ninja import Router
from ninja.errors import HttpError
import logging
from .process_manager import TeamServerManager
from .schemas import StartTeamServerSchema, TeamServerResponseSchema, LogEntrySchema, StopTeamServerResponseSchema
from apps.security import SimpleJWTBearer
import json
from pathlib import Path
from typing import List, Optional
from django.conf import settings

logger = logging.getLogger(__name__)

router = Router()

# Initialize the TeamServerManager
teamserver_manager = TeamServerManager()

@router.post("/start/", response=TeamServerResponseSchema, auth=SimpleJWTBearer())
def start_teamserver(request, payload: StartTeamServerSchema):
    """
    Start the TeamServer with the provided configuration.
    Only Admin users can perform this action.
    """
    user = request.auth
    if not user:
        raise HttpError(401, "Unauthorized: Please log in.")

    if user.profile.role != "Admin":
        raise HttpError(403, "Forbidden: Only Admins can start TeamServer.")

    try:
        pid = teamserver_manager.start_teamserver(
            host=payload.host,
            password=payload.password,
            port=payload.port,
            secure=payload.secure
        )
        return TeamServerResponseSchema(detail="TeamServer started successfully.", pid=pid)
    except FileNotFoundError as fnf_err:
        logger.error(fnf_err)
        raise HttpError(500, str(fnf_err))
    except Exception as e:
        logger.exception("Failed to start TeamServer.")
        raise HttpError(500, "Internal Server Error: Unable to start TeamServer.")

@router.post("/stop/", response=StopTeamServerResponseSchema, auth=SimpleJWTBearer())
def stop_teamserver(request):
    """
    Stop the currently running TeamServer.
    Only Admin users can perform this action.
    """
    user = request.auth
    if not user:
        raise HttpError(401, "Unauthorized: Please log in.")

    if user.profile.role != "Admin":
        raise HttpError(403, "Forbidden: Only Admins can stop TeamServer.")

    try:
        teamserver_manager.stop_teamserver()
        return StopTeamServerResponseSchema(detail="TeamServer stopped successfully.")
    except Exception as e:
        logger.exception("Failed to stop TeamServer.")
        raise HttpError(500, "Internal Server Error: Unable to stop TeamServer.")

@router.get("/logs/", response=List[LogEntrySchema], auth=SimpleJWTBearer())
def get_logs(request, limit: int = 100, level: Optional[str] = None):
    """
    Fetch the latest log entries.

    - **limit**: Number of recent log entries to retrieve. Default is 100.
    - **level**: Filter logs by level (e.g., DEBUG, INFO, WARNING, ERROR). Optional.
    """
    log_file_path = Path(settings.BASE_DIR).parent / 'urza' / 'urza' / 'core' / 'teamserver' / 'logs' / 'live_logs.json'

    if not log_file_path.exists():
        logger.error(f"Log file not found at {log_file_path}")
        return []  # Return empty list instead of raising an error

    try:
        with log_file_path.open('r', encoding='utf-8') as f:
            lines = f.readlines()
            recent_lines = lines[-limit:]
            recent_lines = [line for line in recent_lines if line.strip()]

            if not recent_lines:
                logger.debug("No recent log entries found.")
                return []

            log_entries = [json.loads(line) for line in recent_lines]

            if level:
                log_entries = [entry for entry in log_entries if entry.get('level').upper() == level.upper()]
                logger.debug(f"Filtering logs by level: {level}. Logs found: {len(log_entries)}")
            else:
                logger.debug(f"Retrieving all logs. Total logs returned: {len(log_entries)}")

            log_entries.reverse()  # Newest first
            return log_entries
    except json.JSONDecodeError as jde:
        logger.exception(f"JSON decode error: {jde}")
        return []
    except Exception as e:
        logger.exception(f"Failed to read log file: {e}")
        return []

