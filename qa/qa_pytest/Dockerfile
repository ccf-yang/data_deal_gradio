# 使用基础镜像
FROM qa-pytest-base:latest

# 配置pip源
RUN pip config set global.index-url https://pypi.doubanio.com/simple/

ENV DJANGO_HOST=http://192.168.71.145:8000

# Set the working directory
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install necessary Python packages
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 4567

# Command to run your application
CMD ["python", "utils/auto_api_for_platform.py"]