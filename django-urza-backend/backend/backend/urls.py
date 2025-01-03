# django-urza-backend\backend\backend\urls.py

from django.contrib import admin
from django.urls import path
from apps.users.api import CustomTokenObtainPairView  # Import custom view
from apps.api import api  # Main API router
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/", api.urls),  # Single inclusion for all API routes
    path("api/token/", CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path("api/token/refresh/", TokenRefreshView.as_view(), name='token_refresh'),
    # No separate inclusion for logout; it's part of the API router
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
