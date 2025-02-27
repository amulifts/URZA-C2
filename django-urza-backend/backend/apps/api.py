# URZA-C2/django-urza-backend/backend/apps/api.py

from ninja import NinjaAPI
from apps.users.api import user_router
from apps.st_client.api import st_client_router
from apps.st_teamserver.api import router as st_teamserver_router
# from apps.c2.api import c2_router  # Uncomment if needed
from ninja_jwt.authentication import JWTAuth

api = NinjaAPI(auth=JWTAuth())

api.add_router("/users/", user_router)
api.add_router("/st_client/", st_client_router)
api.add_router("/st_teamserver/", st_teamserver_router)  # Add the new router
# api.add_router("/c2/", c2_router)  # Uncomment if needed

# Add other routers as needed
