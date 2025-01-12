# django-urza-backend\backend\apps\users\models.py

from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    ROLE_CHOICES = [
        ('Admin', 'Admin'),
        ('User', 'User'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255, blank=True)
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='User',
        help_text='Select the user role.',
    )

    def __str__(self):
        return self.user.username
