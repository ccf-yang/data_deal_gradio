#!/bin/bash

mkdir -p ../data/mysql ../data/redis ../data/dataresults

docker-compose up -d --build

# --build 参数会让每次启动都会重新构建

# 停止: docker-compose stop

# 启动: docker-compose start

# 重启: docker-compose restart

# 删除: docker-compose down

# 查看log: docker-compose logs qa_api