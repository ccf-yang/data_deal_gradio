from django.core.management.base import BaseCommand
from django.core.management import execute_from_command_line
import os
import sys

class Command(BaseCommand):
    help = 'Start the API server'

    def add_arguments(self, parser):
        parser.add_argument('--port', type=int, default=8000, help='Port to run the server on')
        parser.add_argument('--host', type=str, default='127.0.0.1', help='Host to run the server on')

    def handle(self, *args, **options):
        port = options['port']
        host = options['host']
        self.stdout.write(f'Starting API server at {host}:{port}')
        execute_from_command_line(['manage.py', 'runserver', f'{host}:{port}'])
