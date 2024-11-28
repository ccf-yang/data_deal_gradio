from django.db import models

# Create your models here.

class Environment(models.Model):
    name = models.CharField(max_length=100, unique=True)
    host = models.CharField(max_length=200)
    port = models.IntegerField()
    secret_key = models.CharField(max_length=500)

    def __str__(self):
        return self.name
