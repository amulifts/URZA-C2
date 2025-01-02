# backend/apps/users/models.py

from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=200, blank=True)
    role = models.CharField(max_length=50, default="User")  # This defaults to "User"
    image_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} Profile"
