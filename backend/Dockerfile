FROM node:18-alpine

WORKDIR /app

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories \
    && apk add --no-cache python3 py3-setuptools make g++
RUN npm config set registry https://registry.npmmirror.com

ENV npm_config_build_from_source=true
ENV npm_config_nodedir=/usr/local

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
