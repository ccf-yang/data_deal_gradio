from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from utils import human_datetime 



class User(models.Model):
    id = models.BigAutoField(primary_key=True)
    username = models.CharField(max_length=100)
    nickname = models.CharField(max_length=100)
    password_hash = models.CharField(max_length=100)  # hashed password
    type = models.CharField(max_length=20, default='default')
    is_supper = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    access_token = models.CharField(max_length=32)
    token_expired = models.IntegerField(null=True)
    last_login = models.CharField(max_length=20)
    last_ip = models.CharField(max_length=50)
    created_at = models.CharField(max_length=20, default=human_datetime)
    deleted_at = models.CharField(max_length=20, null=True)

    class Meta:
        app_label = 'account'
        db_table = 'users'

    @staticmethod
    def make_password(plain_password: str) -> str:
        """
        使用Django内置的make_password函数来创建密码哈希。
        这是Django自带的功能，用于安全地存储密码。
        """
        return make_password(plain_password, hasher='pbkdf2_sha256')

    def verify_password(self, plain_password: str) -> bool:
        """
        使用Django内置的check_password函数来验证密码。
        这也是Django自带的功能，用于安全地验证密码。
        """
        return check_password(plain_password, self.password_hash)

    def __repr__(self):
        return '<User %r>' % self.username
    
    def delete(self, using=None, keep_parents=False):
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


class History(models.Model):
    id = models.BigAutoField(primary_key=True)
    username = models.CharField(max_length=100, null=True)
    type = models.CharField(max_length=20, default='default')
    ip = models.CharField(max_length=50)
    agent = models.CharField(max_length=255, null=True)
    message = models.CharField(max_length=255, null=True)
    is_success = models.BooleanField(default=True)
    created_at = models.CharField(max_length=20, default=human_datetime)

    class Meta:
        app_label = 'account'
        db_table = 'login_histories'
        ordering = ('-id',)

    def to_dict(self, excludes: tuple = None, selects: tuple = None) -> dict:
        if not hasattr(self, '_meta'):
            raise TypeError('<%r> does not a django.db.models.Model object.' % self)
        elif selects:
            return {f: getattr(self, f) for f in selects}
        elif excludes:
            return {f.attname: getattr(self, f.attname) for f in self._meta.fields if f.attname not in excludes}
        else:
            return {f.attname: getattr(self, f.attname) for f in self._meta.fields}
