# backend/apps/users/api.py

from ninja import Router
from django.contrib.auth.models import User
from pydantic import BaseModel, Field
from typing import List, Optional
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse
from ninja.errors import HttpError

user_router = Router()

class UserCreateSchema(BaseModel):
    username: str = Field(..., min_length=3, max_length=150)
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None
    image_url: Optional[str] = None

class UserUpdateSchema(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=150)
    password: Optional[str] = Field(None, min_length=6)
    full_name: Optional[str] = None
    image_url: Optional[str] = None

class UserOutSchema(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    role: str
    image_url: Optional[str] = None

class LoginSchema(BaseModel):
    username: str
    password: str

@user_router.post("/create", response=UserOutSchema)
def create_user(request, payload: UserCreateSchema):
    """
    Create a new user with role="User" always.
    """
    if User.objects.filter(username=payload.username).exists():
        raise HttpError(400, "Username already exists.")
    
    user = User.objects.create_user(
        username=payload.username,
        password=payload.password
    )

    # Now handle the profile fields
    profile = user.profile
    if payload.full_name:
        profile.full_name = payload.full_name
    if payload.image_url:
        profile.image_url = payload.image_url
    # Force role to "User"
    profile.role = "User"
    profile.save()

    return UserOutSchema(
        id=user.id,
        username=user.username,
        full_name=profile.full_name,
        role=profile.role,
        image_url=profile.image_url,
    )

@user_router.get("/all", response=List[UserOutSchema])
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
        image_url=profile.image_url,
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
    if payload.image_url is not None:
        profile.image_url = payload.image_url
    profile.save()

    return UserOutSchema(
        id=user.id,
        username=user.username,
        full_name=profile.full_name,
        role=profile.role,
        image_url=profile.image_url,
    )

@user_router.delete("/id/{user_id}")
def delete_user(request, user_id: int):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise HttpError(404, "User not found.")
    user.delete()
    return {"success": True}

@user_router.post("/login")
def login_user(request, payload: LoginSchema):
    user = authenticate(request, username=payload.username, password=payload.password)
    if user is not None:
        login(request, user)
        return {"success": True, "message": "Logged in"}
    raise HttpError(400, "Invalid credentials.")

@user_router.post("/logout")
def logout_user(request):
    logout(request)
    return {"success": True, "message": "Logged out"}

# This can be used from frontend to check "Am I logged in?, Which user am I?"
@user_router.get("/me", response=UserOutSchema)
def get_current_user(request):
    if not request.user.is_authenticated:
        raise HttpError(401, "Not authenticated.")

    profile = request.user.profile  # one-to-one
    return UserOutSchema(
        id=request.user.id,
        username=request.user.username,
        full_name=profile.full_name,
        role=profile.role,
        image_url=profile.image_url,
    )

@user_router.get("/list", response=List[UserOutSchema])
def list_users(request):
    """
    List all users if the current user is an Admin.
    """
    if not request.user.is_authenticated:
        raise HttpError(403, "Not authenticated.")
    
    if request.user.profile.role != "Admin":
        raise HttpError(403, "Only admins can list users.")

    all_users = User.objects.select_related('profile').all()
    users_data = [
        UserOutSchema(
            id=u.id,
            username=u.username,
            full_name=u.profile.full_name,
            role=u.profile.role,
            image_url=u.profile.image_url,
        ) for u in all_users
    ]
    return users_data


@user_router.post("/impersonate/{target_user_id}", response=UserOutSchema)
def impersonate_user(request, target_user_id: int):
    """
    Admin-only endpoint: switch session to target user (login as them).
    """
    if not request.user.is_authenticated:
        raise HttpError(403, "Not authenticated.")
    
    if request.user.profile.role != "Admin":
        raise HttpError(403, "Only admins can impersonate.")

    try:
        target = User.objects.get(id=target_user_id)
    except User.DoesNotExist:
        raise HttpError(404, "User not found.")

    from django.contrib.auth import logout, login

    # Log out the current user (Admin)
    logout(request)

    # Log in as the target user
    target.backend = "django.contrib.auth.backends.ModelBackend"
    login(request, target)

    profile = target.profile
    return UserOutSchema(
        id=target.id,
        username=target.username,
        full_name=profile.full_name,
        role=profile.role,
        image_url=profile.image_url,
    )