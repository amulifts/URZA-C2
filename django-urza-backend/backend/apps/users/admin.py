# django-urza-backend\backend\apps\users\admin.py

from django.contrib import admin
from django import forms
from .models import Profile
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

# Define a custom form for the Profile model
class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = '__all__'
        labels = {
            'user': 'Username',
            'full_name': 'Full Name',
            'role': 'Role',
        }
        widgets = {
            'role': forms.Select(choices=Profile.ROLE_CHOICES),
        }

# Define an inline admin descriptor for Profile model
class ProfileInline(admin.StackedInline):
    model = Profile
    form = ProfileForm
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'

# Define a new User admin
class CustomUserAdmin(BaseUserAdmin):
    inlines = (ProfileInline, )
    list_display = ('username', 'email', 'first_name', 'last_name', 'get_full_name', 'get_role', 'is_staff')
    list_select_related = ('profile', )

    def get_full_name(self, obj):
        return obj.profile.full_name
    get_full_name.short_description = 'Full Name'

    def get_role(self, obj):
        return obj.profile.role
    get_role.short_description = 'Role'

    # Optional: Add filtering options based on role
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('profile')

# Unregister the original User admin and register the new one
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)
