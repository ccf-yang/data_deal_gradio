#!/bin/bash

# 安装 Node.js 16.x
echo "正在安装 Node.js 16.x..."
curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
apt-get install -y nodejs

# 安装构建工具
echo "正在安装必要的构建工具..."
apt-get update
apt-get install -y git python3 make g++

# 创建项目目录
echo "创建项目目录..."
mkdir -p /app
cd /app

# 克隆amis项目
echo "克隆amis项目..."
git clone https://gitee.com/baidu/amis.git .

# 配置npm镜像
echo "配置npm镜像源..."
npm config set registry https://registry.npmmirror.com/
npm cache clean --force

# 安装项目依赖
echo "安装项目依赖..."
npm i --legacy-peer-deps

# 启动项目
echo "启动项目..."
npm start

echo "安装完成！"
echo "请访问 http://127.0.0.1:8888/examples/pages/simple 查看项目"
