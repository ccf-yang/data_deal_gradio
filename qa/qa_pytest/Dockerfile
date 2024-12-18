# Use the official Python image
FROM python:3.9-slim

# 更换所有apt源为阿里源
RUN rm -rf /etc/apt/sources.list.d/* && \
    echo "deb https://mirrors.aliyun.com/debian/ bookworm main non-free contrib" > /etc/apt/sources.list && \
    echo "deb-src https://mirrors.aliyun.com/debian/ bookworm main non-free contrib" >> /etc/apt/sources.list && \
    echo "deb https://mirrors.aliyun.com/debian-security/ bookworm-security main non-free contrib" >> /etc/apt/sources.list && \
    echo "deb-src https://mirrors.aliyun.com/debian-security/ bookworm-security main non-free contrib" >> /etc/apt/sources.list && \
    echo "deb https://mirrors.aliyun.com/debian/ bookworm-updates main non-free contrib" >> /etc/apt/sources.list && \
    echo "deb-src https://mirrors.aliyun.com/debian/ bookworm-updates main non-free contrib" >> /etc/apt/sources.list && \
    echo "deb https://mirrors.aliyun.com/debian/ bookworm-backports main non-free contrib" >> /etc/apt/sources.list && \
    echo "deb-src https://mirrors.aliyun.com/debian/ bookworm-backports main non-free contrib" >> /etc/apt/sources.list
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