# django-urza-backend\backend\apps\api.py

from ninja import NinjaAPI
from apps.users.api import user_router
# Uncomment and add other routers as needed
# from apps.st_client.api import st_client_router
# from apps.c2.api import c2_router

api = NinjaAPI(version='1.0.0')  # Unique version identifier

api.add_router("/users/", user_router)
# api.add_router("/st_client/", st_client_router)
# api.add_router("/c2/", c2_router)
# Add other routers as needed

