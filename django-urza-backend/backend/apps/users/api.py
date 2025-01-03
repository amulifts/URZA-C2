# django-urza-backend/backend/apps/users/api.py

from ninja import Router, Form
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from django.contrib.auth.models import User
from ninja.errors import HttpError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
import logging

logger = logging.getLogger(__name__)

user_router = Router()

# Schemas
class UserCreateSchema(BaseModel):
    username: str = Form(..., min_length=3, max_length=150)
    password: str = Form(..., min_length=6)
    confirm_password: str = Form(..., min_length=6)
    full_name: Optional[str] = Form(None)

    model_config = ConfigDict(arbitrary_types_allowed=True)

class UserUpdateSchema(BaseModel):
    username: Optional[str] = Form(None, min_length=3, max_length=150)
    password: Optional[str] = Form(None, min_length=6)
    full_name: Optional[str] = Form(None)

class UserOutSchema(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    role: str

class TokenResponseSchema(BaseModel):
    access: str
    refresh: str

class LogoutSchema(BaseModel):
    refresh_token: str

class UserListOutSchema(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    role: str

# Custom TokenObtainPairSerializer
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['full_name'] = user.profile.full_name or ""

        return token

# Custom TokenObtainPairView
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# Endpoints
@user_router.post("/create", response=UserOutSchema)
def create_user(request, payload: UserCreateSchema):
    """
    Create a new user with role="User" always.
    """
    try:
        if payload.password != payload.confirm_password:
            logger.error("Passwords do not match.")
            raise HttpError(400, "Passwords do not match.")
        
        if User.objects.filter(username=payload.username).exists():
            logger.error("Username already exists.")
            raise HttpError(400, "Username already exists.")
        
        user = User.objects.create_user(
            username=payload.username,
            password=payload.password
        )

        # Handle profile fields
        profile = user.profile
        profile.full_name = payload.full_name or profile.full_name
        # Role is already set to "User" by default
        profile.save()

        logger.info(f"User created successfully: {user.username}")
        return UserOutSchema(
            id=user.id,
            username=user.username,
            full_name=profile.full_name,
            role=profile.role,
        )
    except Exception as e:
        logger.exception("Error creating user.")
        raise HttpError(500, f"Internal Server Error: {str(e)}")

@user_router.get("/id/{user_id}", response=UserOutSchema)
def get_user(request, user_id: int):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise HttpError(404, "User not found.")
    
    profile = user.profile
    return UserOutSchema(
        id=user.id,
        username=user.username,
        full_name=profile.full_name,
        role=profile.role,
    )

@user_router.put("/id/{user_id}", response=UserOutSchema)
def update_user(request, user_id: int, payload: UserUpdateSchema):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise HttpError(404, "User not found.")
    
    if payload.username:
        if User.objects.filter(username=payload.username).exclude(id=user_id).exists():
            raise HttpError(400, "Username already taken.")
        user.username = payload.username
    if payload.password:
        user.set_password(payload.password)
    user.save()

    profile = user.profile
    if payload.full_name is not None:
        profile.full_name = payload.full_name
    profile.save()

    return UserOutSchema(
        id=user.id,
        username=user.username,
        full_name=profile.full_name,
        role=profile.role,
    )

@user_router.delete("/id/{user_id}")
def delete_user(request, user_id: int):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise HttpError(404, "User not found.")
    user.delete()
    return {"success": True}

@user_router.get("/list", response=List[UserListOutSchema])
def list_users(request):
    """
    List all users. Admin-only.
    """
    if not request.user.is_authenticated:
        raise HttpError(403, "Not authenticated.")
    if request.user.profile.role != "Admin":
        raise HttpError(403, "Only admins can view the user list.")
    
    users = User.objects.all()
    user_list = []
    for user in users:
        profile = user.profile
        user_list.append(UserListOutSchema(
            id=user.id,
            username=user.username,
            full_name=profile.full_name,
            role=profile.role,
        ))
    return user_list

@user_router.post("/impersonate/{target_user_id}", response=TokenResponseSchema)
def impersonate_user(request, target_user_id: int):
    """
    Admin-only endpoint: generate JWT tokens for the target user (impersonate).
    """
    if not request.user.is_authenticated:
        raise HttpError(403, "Not authenticated.")
    
    if request.user.profile.role != "Admin":
        raise HttpError(403, "Only admins can impersonate.")

    try:
        target = User.objects.get(id=target_user_id)
    except User.DoesNotExist:
        raise HttpError(404, "User not found.")

    refresh = RefreshToken.for_user(target)
    return TokenResponseSchema(
        access=str(refresh.access_token),
        refresh=str(refresh),
    )

@user_router.post("/logout", response={"success": bool})
def logout_user(request, payload: LogoutSchema):
    """
    Blacklist the refresh token.
    """
    try:
        token = RefreshToken(payload.refresh_token)
        token.blacklist()
        return {"success": True}
    except Exception as e:
        logger.error(f"Logout failed: {e}")
        raise HttpError(400, "Invalid token.")
