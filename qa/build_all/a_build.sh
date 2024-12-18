#!/bin/bash

operate=$1
if [ "$operate" == "start" ]; then
    # up api and web
    mkdir -p ../data/mysql ../data/redis ../data/dataresults
    docker-compose up -d --build
    #up pytest
    cd ../qa_pytest
    # 检查基础镜像是否存在
    if [[ "$(docker images -q qa-pytest-base:latest 2> /dev/null)" == "" ]]; then
        echo "基础镜像不存在，开始构建基础镜像..."
        docker build -t qa-pytest-base:latest -f Dockerfile.base .
    fi
    # 构建主镜像
    docker-compose up -d --build
elif [ "$operate" == "stop" ]; then
    # down api and web
    docker-compose down
    # down pytest
    cd ../qa_pytest
    docker-compose down
elif [ "$operate" == "restart" ]; then
    # restart api and web
    docker-compose restart
    # restart pytest
    cd ../qa_pytest
    docker-compose restart
else
    echo "Usage: $0 start|stop|restart"
fi



# --build 参数会让每次启动都会重新构建

# 停止: docker-compose stop

# 启动: docker-compose start

# 重启: docker-compose restart

# 删除: docker-compose down

# 查看log: docker-compose logs qa_api