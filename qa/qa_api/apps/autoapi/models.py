from django.db import models
import json
from apps.savedapi.models import SavedAPI

# Create your models here.

class SavedApiCode(models.Model):
    api_method = models.CharField(max_length=10)
    api_path = models.CharField(max_length=500)
    directory = models.CharField(max_length=100)
    bussiness_code = models.TextField(null=True, blank=True)
    common_code = models.TextField(null=True, blank=True)
    testcases_code = models.TextField(null=True, blank=True)
    is_auto_test = models.BooleanField(default=False)
    report_url = models.CharField(max_length=500, null=True, blank=True)
    header_params = models.TextField(null=True, blank=True)
    path_params = models.TextField(null=True, blank=True)
    query_params = models.TextField(null=True, blank=True)
    body_params = models.TextField(null=True, blank=True)
    response_params = models.TextField(null=True, blank=True)
    group = models.TextField(default='[]')
    apiinfo = models.JSONField(null=True, blank=True)

    class Meta:
        unique_together = ('api_method', 'api_path', 'directory')

    def __str__(self):
        return f"{self.api_method} {self.api_path} ({self.directory})"

    def set_group(self, group_list):
        self.group = json.dumps(group_list)

    def get_group(self):
        return json.loads(self.group)

    def save(self, *args, **kwargs):
        # If this is a new record (no ID) and apiinfo is not set
        if not self.pk and not self.apiinfo:
            try:
                # Try to find the corresponding SavedAPI record
                saved_api = SavedAPI.objects.get(
                    directory=self.directory,
                    api_method=self.api_method,
                    api_path=self.api_path
                )
                # Copy apiinfo from SavedAPI
                self.apiinfo = saved_api.apiinfo
            except SavedAPI.DoesNotExist:
                pass
        super().save(*args, **kwargs)


class Group(models.Model):
    name = models.CharField(max_length=255, unique=True)
    url = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'group'

    def __str__(self):
        return self.name