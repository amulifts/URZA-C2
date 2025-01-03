# django-urza-backend/backend/apps/users/admin.py

from django.contrib import admin
from .models import Profile

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'role')
    search_fields = ('user__username', 'full_name', 'role')
