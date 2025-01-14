# django-urza-backend/backend/apps/st_teamserver/schemas.py

from typing import Optional
from ninja import Schema
from pydantic import Field

class StartTeamServerSchema(Schema):
    host: str = Field(..., example="0.0.0.0")
    password: str = Field(..., example="mypassword")
    port: int = Field(..., example=6000)
    secure: bool = Field(..., example=False, description="True for WSS (HTTPS), False for WS (HTTP)")

class TeamServerResponseSchema(Schema):
    detail: str
    pid: Optional[int] = Field(None, example=12345, description="Process ID if started successfully")

class StopTeamServerResponseSchema(Schema):
    detail: str

class TeamServerConfigSchema(Schema):
    host: str
    password: str
    port: int
    secure: bool

class LogEntrySchema(Schema):
    time: str
    level: str
    message: str
    name: str
    filename: str
    lineno: int
    funcName: str
