from django.db import models
import json


class Setting(models.Model):
    key = models.CharField(max_length=50, unique=True)
    value = models.TextField()
    desc = models.CharField(max_length=255, null=True)

    @property
    def real_val(self):
        if self.value:
            return json.loads(self.value)
        else:
            return ''

    def __repr__(self):
        return '<Setting %r>' % self.key

    class Meta:
        db_table = 'settings'
