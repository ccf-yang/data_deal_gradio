# Build stage
FROM node:16-alpine as build

# Set working directory
WORKDIR /app

# Update npm first and set configurations
RUN npm config set registry https://registry.npmmirror.com/ \
    && npm install -g npm@8.19.4 \
    && npm config set fetch-retry-maxtimeout 600000 \
    && npm config set fetch-timeout 600000 \
    && npm config set strict-ssl false

# Copy package files
COPY ./package*.json ./

# Clean install without package-lock
RUN rm -f package-lock.json && npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration if you have one
COPY ./build_script/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]