# URZA-C2/django-urza-backend/backend/apps/st_teamserver/api.py

from ninja import Router
from ninja.errors import HttpError
import logging
from .process_manager import TeamServerManager
from .schemas import (
    StartTeamServerSchema, 
    TeamServerResponseSchema, 
    StopTeamServerResponseSchema, 
    LogEntrySchema
)
from apps.security import SimpleJWTBearer
from typing import List, Optional
from django.conf import settings
from pathlib import Path
import json
import re

logger = logging.getLogger(__name__)
router = Router()
teamserver_manager = TeamServerManager()

@router.post("/start/", response=TeamServerResponseSchema, auth=SimpleJWTBearer())
def start_teamserver(request, payload: StartTeamServerSchema):
    user = request.auth
    if not user or user.profile.role != "Admin":
        raise HttpError(403, "Forbidden: Only Admins can start TeamServer.")

    try:
        pid = teamserver_manager.start_teamserver(
            host=payload.host,
            password=payload.password,
            port=payload.port,
            secure=payload.secure
        )
        return TeamServerResponseSchema(detail="TeamServer started successfully.", pid=pid)
    except Exception as e:
        logger.exception("Failed to start TeamServer.")
        raise HttpError(500, str(e))

@router.post("/stop/", response=StopTeamServerResponseSchema, auth=SimpleJWTBearer())
def stop_teamserver(request):
    user = request.auth
    if not user or user.profile.role != "Admin":
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
    
    """
    Retrieve the list of active listeners by parsing live_logs.json.
    Only Admin users can access this data.
    """
    user = request.auth
    if not user:
        raise HttpError(401, "Unauthorized: Please log in.")

    if user.profile.role != "Admin":
        raise HttpError(403, "Forbidden: Only Admins can view listeners.")

    log_file_path = Path(settings.BASE_DIR).parent / 'urza' / 'urza' / 'core' / 'teamserver' / 'logs' / 'live_logs.json'

    if not log_file_path.exists():
        logger.error(f"Log file not found at {log_file_path}")
        raise HttpError(404, "Log file not found.")

    try:
        with log_file_path.open('r', encoding='utf-8') as f:
            lines = f.readlines()

        listeners = {}
        listener_start_pattern = re.compile(r"Started (\w+) listener \(([\d.]+):(\d+)\)", re.IGNORECASE)
        listener_stop_pattern = re.compile(r"TeamServer stopped on\s+([\d.]+):(\d+)", re.IGNORECASE)

        for line in reversed(lines):  # Start from the latest logs
            try:
                log_entry = json.loads(line)
                message = log_entry.get('message', '')

                # Check for listener start
                start_match = listener_start_pattern.search(message)
                if start_match:
                    listener_type = start_match.group(1)
                    host = start_match.group(2)
                    port = int(start_match.group(3))
                    name = f"{listener_type}-{port}"
                    if name not in listeners:
                        listeners[name] = {
                            "name": name,
                            "listener_type": listener_type,
                            "host": host,
                            "port": port,
                            "status": "Active",
                            "start_time": log_entry.get('time', 'N/A'),
                        }
                    continue  # Proceed to next log

                # Check for listener stop
                stop_match = listener_stop_pattern.search(message)
                if stop_match:
                    host = stop_match.group(1)
                    port = int(stop_match.group(2))
                    name = f"Listener-{port}"
                    if name in listeners:
                        listeners[name]["status"] = "Inactive"
                        listeners[name]["start_time"] = log_entry.get('time', 'N/A')
                    continue

            except json.JSONDecodeError as jde:
                logger.warning(f"Skipping malformed log line: {jde}")
                continue

        # Convert the listeners dict to a list
        listeners_list = list(listeners.values())

        logger.debug(f"Extracted {len(listeners_list)} listeners from logs.")
        return listeners_list

    except Exception as e:
        logger.exception(f"Failed to parse listeners from logs: {e}")
        raise HttpError(500, "Internal Server Error: Unable to parse listeners.")