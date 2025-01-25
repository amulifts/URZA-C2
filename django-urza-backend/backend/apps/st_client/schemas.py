# URZA-C2/django-urza-backend/backend/apps/st_client/schemas.py

from ninja import Schema
from pydantic import AnyUrl  # Changed from HttpUrl to AnyUrl
from typing import Optional
from pydantic.fields import Field

class ConnectRequest(Schema):
    connection_url: AnyUrl  # Now accepts ws:// and wss:// URLs

# Resonse for PID 
class PidResponse(Schema):
    detail: str
    pid: Optional[int] = Field(None, example=12345, description="Process ID if started successfully")