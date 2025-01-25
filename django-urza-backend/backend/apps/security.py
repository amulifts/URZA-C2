# URZA-C2/django-urza-backend/backend/apps/security.py

from ninja.security import HttpBearer
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _
from ninja.errors import HttpError

class SimpleJWTBearer(HttpBearer):
    def authenticate(self, request, token):
        """
        1) Decode the token with DRF's AccessToken
        2) Look up the user
        3) Return user (or None) so Ninja can set request.user
        """
        try:
            validated_token = AccessToken(token)   # Will raise if invalid/expired
            user_id = validated_token["user_id"]
            user = User.objects.get(id=user_id)
            return user
        except Exception as exc:
            # If anything fails (token invalid, user not found, etc.)
            raise HttpError(401, _("Invalid or expired token"))
