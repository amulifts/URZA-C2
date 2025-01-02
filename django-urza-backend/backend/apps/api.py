# backend/apps/api.py

from ninja import NinjaAPI
from apps.users.api import user_router

api = NinjaAPI()

api.add_router("/users", user_router)
