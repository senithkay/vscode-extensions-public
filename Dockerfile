FROM node:10

# Copy dir
WORKDIR /working
COPY . /working

# install ballerina
RUN wget https://product-dist.ballerina.io/downloads/1.2.0/ballerina-linux-installer-x64-1.2.0.deb
RUN dpkg -i ballerina-linux-installer-x64-1.2.0.deb

# start lang server
WORKDIR lang-server
RUN npm ci
RUN npm start