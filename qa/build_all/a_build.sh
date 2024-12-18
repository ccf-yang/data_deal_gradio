#!/bin/bash

operate=$1
if [ "$operate" == "start" ]; then
    # up api and web
    mkdir -p ../data/mysql ../data/redis ../data/dataresults
    docker-compose up -d --build
    #up pytest
    cd ../qa_pytest
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