from django.db import models

# Create your models here.

class FunctionCase(models.Model):
    name = models.CharField(max_length=255)
    module = models.CharField(max_length=255)
    testtitle = models.CharField(max_length=255)
    directory = models.CharField(max_length=255)
    importance = models.CharField(max_length=50)
    precondition = models.TextField()
    testinput = models.TextField()
    steps = models.TextField()
    expectedresults = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'function_cases'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.testtitle}"
