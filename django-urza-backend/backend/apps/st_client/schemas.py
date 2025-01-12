# django-urza-backend/backend/apps/st_client/schemas.py

from ninja import Schema
from pydantic import AnyUrl  # Changed from HttpUrl to AnyUrl

class ConnectRequest(Schema):
    connection_url: AnyUrl  # Now accepts ws:// and wss:// URLs
