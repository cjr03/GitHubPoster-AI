from django.db import models
from django.contrib.auth.models import User
from datetime import datetime

# UserToken store
class UserToken(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    token = models.TextField()  
    created_at = models.DateTimeField(auto_now_add=True)  

    def __str__(self):
        return f"Token for {self.user.username}"

class Draft(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, default="Unnamed Draft")
    description = models.TextField()
    audience = models.CharField(max_length=100)
    style = models.CharField(max_length=100)
    tone = models.CharField(max_length=100)
    hashtags = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    generated_description = models.TextField(default="")

    def __str__(self):
        return self.name