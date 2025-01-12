# django-urza-backend/backend/apps/api.py

from ninja import NinjaAPI
from apps.users.api import user_router
from apps.st_client.api import router
# from apps.c2.api import c2_router  # Uncomment if needed
from ninja_jwt.authentication import JWTAuth

api = NinjaAPI(auth=JWTAuth())

api.add_router("/users/", user_router)
api.add_router("/st_client/", router)
# api.add_router("/c2/", c2_router)  # Uncomment if needed

# Add other routers as needed
