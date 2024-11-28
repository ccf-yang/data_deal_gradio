from django.db import models

# Create your models here.

class FunctionTask(models.Model):
    name = models.CharField(max_length=255)
    assigned_person = models.CharField(max_length=255)
    cases = models.TextField()  # Store as JSON string
    status = models.CharField(max_length=50)
    deadline = models.DateTimeField(null=True, blank=True)  # Add deadline field
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'function_tasks'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.assigned_person}"
