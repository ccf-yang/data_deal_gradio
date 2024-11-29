#!/bin/bash
set -e

# Wait for database to be ready
echo "Waiting for MySQL to be ready..."
while ! nc -z $MYSQL_HOST 3306; do
    sleep 1
done
echo "MySQL is ready!"

# Wait for Redis
echo "Waiting for Redis to be ready..."
while ! nc -z $REDIS_HOST 6379; do
    sleep 1
done
echo "Redis is ready!"

# Run migrations
echo "Running makemigrations..."
python manage.py makemigrations

echo "Running migrations..."
python manage.py migrate

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start server
echo "Starting Django server..."
python manage.py runserver 0.0.0.0:8000