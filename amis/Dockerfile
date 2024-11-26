# 使用更具体的Node.js镜像标签
FROM node:16.20.0-slim

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=development
ENV PATH /app/node_modules/.bin:$PaATH

# 安装git和必要的构建工具
RUN apt-get update && \
    apt-get install -y git python3 make g++ && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 克隆amis项目
RUN git clone https://gitee.com/baidu/amis.git .

# 设置npm镜像源为npmmirror
RUN npm config set registry https://registry.npmmirror.com/ && \
    npm cache clean --force

# 安装项目依赖（使用--legacy-peer-deps跳过peer依赖检查）
RUN npm i --legacy-peer-deps

# 暴露8888端口
EXPOSE 8888

# 启动项目
CMD ["npm", "start"]
