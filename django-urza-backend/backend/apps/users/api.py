# django-urza-backend\backend\apps\users\api.py

from ninja import Router, Form
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from django.contrib.auth.models import User
from ninja.errors import HttpError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
import logging
# IMPORT FROM YOUR LOCAL FILE:
from apps.security import SimpleJWTBearer  

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
    username: Optional[str] = None
    password: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None

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
        token['id'] = user.id
        token['username'] = user.username
        token['full_name'] = user.profile.full_name or ""
        token['role'] = user.profile.role

        return token

# Custom TokenObtainPairView
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# Endpoints
@user_router.post("/create", response=UserOutSchema, auth=None)
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
    # 1) Check if request is authenticated
    if not request.user.is_authenticated:
        raise HttpError(401, "Not authenticated.")

    # 2) Attempt to fetch the target user
    try:
        target_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise HttpError(404, "User not found.")

    # 3) If request.user is NOT admin, ensure they're accessing their own user_id
    if request.user.profile.role != "Admin" and request.user.id != target_user.id:
        raise HttpError(403, "You do not have permission to view this user.")

    # Return user info
    profile = target_user.profile
    return UserOutSchema(
        id=target_user.id,
        username=target_user.username,
        full_name=profile.full_name,
        role=profile.role,
    )


@user_router.get("/me", response=UserOutSchema)
def get_current_user(request):
    if not request.user.is_authenticated:
        raise HttpError(401, "Not authenticated.")

    profile = request.user.profile
    return UserOutSchema(
        id=request.user.id,
        username=request.user.username,
        full_name=profile.full_name,
        role=profile.role,
    )

from apps.users.models import Profile

@user_router.put("/id/{user_id}", response=UserOutSchema)
def update_user(request, user_id: int, payload: UserUpdateSchema):
    if not request.user.is_authenticated:
        raise HttpError(401, "Not authenticated.")

    try:
        target_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise HttpError(404, "User not found.")

    # If not admin, must be same user (admin can update any)
    if request.user.profile.role != "Admin" and request.user.id != target_user.id:
        raise HttpError(403, "You cannot modify another user's account.")

    # If updating the username...
    if payload.username:
        if User.objects.filter(username=payload.username).exclude(id=user_id).exists():
            raise HttpError(400, "Username already taken.")
        target_user.username = payload.username

    # If updating password...
    if payload.password:
        target_user.set_password(payload.password)
    
    target_user.save()

    profile = target_user.profile

    # Update full name if provided
    if payload.full_name is not None:
        profile.full_name = payload.full_name

    # NEW: Update role if provided
    if payload.role is not None:
        # Check if the update is changing the admin role
        # (Assuming "Admin" and "User" are the only valid values)
        new_role = payload.role
        # If the current role is "Admin" and new role is not "Admin" and if this is the admin’s own update
        if target_user.id == request.user.id and profile.role == "Admin" and new_role != "Admin":
            # Count how many admin users exist
            admin_count = Profile.objects.filter(role="Admin").count()
            if admin_count <= 1:
                raise HttpError(400, "At least one admin must remain. You cannot change your own role when you are the only admin.")
        # Optionally, you might also want to do a similar check if updating another user's role, to prevent demotion if it would leave no admins.
        profile.role = new_role

    profile.save()

    return UserOutSchema(
        id=target_user.id,
        username=target_user.username,
        full_name=profile.full_name,
        role=profile.role,
    )

@user_router.delete("/id/{user_id}")
def delete_user(request, user_id: int):
    try:
        target_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise HttpError(404, "User not found.")
    
    # If the target user is the same as the logged-in user and is an admin:
    if target_user.id == request.user.id and target_user.profile.role == "Admin":
        # Count the number of admin profiles in the system.
        admin_count = Profile.objects.filter(role="Admin").count()
        if admin_count <= 1:
            raise HttpError(400, "You cannot delete yourself as you are the only admin.")
    
    # Optionally, if you want to prevent deleting other admins in a similar way:
    # if target_user.profile.role == "Admin":
    #    admin_count = Profile.objects.filter(role="Admin").count()
    #    if admin_count <= 1:
    #       raise HttpError(400, "Cannot delete this user because they are the only admin.")

    target_user.delete()
    return {"success": True}


@user_router.get("/list", response=List[UserListOutSchema])
def list_users(request):
    """
    List all users. Admin-only.
    """
    if not request.user.is_authenticated:
        logger.warning("[list_users] request.user is AnonymousUser -> returning 403")
        raise HttpError(403, "Not authenticated.")

    # Print debug info:
    logger.warning(
        f"[list_users] Authenticated user: {request.user.username}, "
        f"is_superuser={request.user.is_superuser}, "
        f"is_staff={request.user.is_staff}, "
        f"profile.role={getattr(request.user.profile, 'role', 'MISSING_PROFILE')}"
    )

    if request.user.profile.role != "Admin":
        logger.warning(f"[list_users] user {request.user.username} has role={request.user.profile.role}, returning 403")
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

# Schema for the token response
class TokenResponseSchema(BaseModel):
    access: str
    refresh: str

@user_router.post("/impersonate/{target_user_id}", response=TokenResponseSchema)
def impersonate_user(request, target_user_id: int):
    try:
        target = User.objects.get(id=target_user_id)
    except User.DoesNotExist:
        raise HttpError(404, "User not found.")

    # 1) Generate a refresh token for the target user
    refresh = RefreshToken.for_user(target)

    # 2) Manually add the same claims you do in CustomTokenObtainPairSerializer
    refresh["id"] = target.id
    refresh["username"] = target.username

    # If you have a Profile model:
    if hasattr(target, 'profile'):
        refresh["full_name"] = target.profile.full_name or ""
        refresh["role"] = target.profile.role
    else:
        refresh["full_name"] = ""
        refresh["role"] = "User"

    # 3) Return the tokens (access & refresh)
    return TokenResponseSchema(
        access=str(refresh.access_token),
        refresh=str(refresh),
    )

@user_router.post("/logout")
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