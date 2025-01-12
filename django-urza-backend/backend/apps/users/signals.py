# django-urza-backend/backend/apps/users/signals.py

from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from .models import Profile
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        role = 'Admin' if instance.is_superuser else 'User'
        Profile.objects.create(user=instance, role=role)
        logger.info(f"Created profile for user {instance.username} with role {role}.")
    else:
        try:
            instance.profile.save()
            logger.info(f"Updated profile for user {instance.username}.")
        except Profile.DoesNotExist:
            Profile.objects.create(user=instance, role='User')
            logger.warning(f"Profile did not exist for user {instance.username}. Created default profile.")
