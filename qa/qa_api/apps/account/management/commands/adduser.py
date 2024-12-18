from django.core.management.base import BaseCommand
from django.core.management import execute_from_command_line


class Command(BaseCommand):
    help = '添加用户'
    def handle(self, *args, **options):
        execute_from_command_line(['manage.py', 'user', 'add', '-u', 'admin', '-p', 'admin', '-n', '管理员', '-s'])
        self.stdout.write(self.style.SUCCESS('添加用户执行成功'))
