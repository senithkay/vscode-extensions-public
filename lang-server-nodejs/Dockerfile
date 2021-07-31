# How to run
# 1. docker build -t lang-server .
# 2. docker run --publish 3000:3000 --detach lang-server

FROM node:10

# Copy dir
WORKDIR /working
COPY . /working

# install ballerina
RUN wget https://product-dist.ballerina.io/downloads/1.2.0/ballerina-linux-installer-x64-1.2.0.deb
RUN dpkg -i ballerina-linux-installer-x64-1.2.0.deb

# start lang server
RUN npm ci
EXPOSE 3000 
CMD ["npm","start"]
