from django.db import models
import json

# Create your models here.

class SavedAPI(models.Model):
    apiinfo = models.JSONField()
    directory = models.CharField(max_length=255)
    api_method = models.CharField(max_length=10)  # GET, POST, PUT, etc.
    api_path = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        # Extract method and path from apiinfo if not set
        if not self.api_method:
            self.api_method = self.apiinfo.get('method', '').upper()
        if not self.api_path:
            self.api_path = self.apiinfo.get('path', '')
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.directory} - {self.api_method} {self.api_path}"
    
    class Meta:
        db_table = 'savedapis'
        indexes = [
            models.Index(fields=['directory', 'api_method', 'api_path']),
        ]
        unique_together = ['directory', 'api_method', 'api_path']

class SavedAPIDirectory(models.Model):
    name = models.CharField(max_length=255, unique=True)
    directory_type = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} ({self.directory_type})"
    
    class Meta:
        verbose_name_plural = "Saved API Directories"
