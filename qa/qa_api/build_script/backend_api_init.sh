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

# Make sure we're in the correct directory
cd /app

# Run migrations
echo "Running makemigrations and migrate "
python manage.py updatedb

# Create superuser if not exists
echo "Creating initial admin user..."
python manage.py user add -u admin -p admin -n 管理员 -s || true

# Start the Django development server
echo "Starting Django server..."
python manage.py runserver 0.0.0.0:8000