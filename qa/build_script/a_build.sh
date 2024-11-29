#!/bin/bash

mkdir -p ../data/mysql ../data/redis

docker-compose up -d

# 查看log: docker-compose logs qa_api