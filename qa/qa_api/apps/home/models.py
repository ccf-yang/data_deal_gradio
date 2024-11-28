from django.db import models
from utils import human_datetime
import json



class Navigation(models.Model):
    title = models.CharField(max_length=64)
    desc = models.CharField(max_length=128)
    logo = models.TextField()
    links = models.TextField()
    sort_id = models.IntegerField(default=0, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    deleted_at = models.CharField(max_length=20, null=True)        

    def to_view(self):
        tmp = self.to_dict()
        tmp['links'] = json.loads(self.links)
        return tmp

    def delete(self):
        self.deleted_at = human_datetime()
        self.save()
    
    def to_dict(self, excludes: tuple = None, selects: tuple = None) -> dict:
        if not hasattr(self, '_meta'):
            raise TypeError('<%r> does not a django.db.models.Model object.' % self)
        elif selects:
            return {f: getattr(self, f) for f in selects}
        elif excludes:
            return {f.attname: getattr(self, f.attname) for f in self._meta.fields if f.attname not in excludes}
        else:
            return {f.attname: getattr(self, f.attname) for f in self._meta.fields}

    class Meta:
        db_table = 'navigations'
        ordering = ('-sort_id',)
