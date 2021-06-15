FROM choreoipaas/choreo-ballerina AS choreo

FROM ubuntu
WORKDIR /root/

# Copy latest ballerina distribution from choreoipaas/choreo-ballerina
COPY --from=choreo /ballerina /ballerina

# Install git
RUN apt-get update && \ 
    apt-get install -y git

# Install OpenJDK-11
RUN apt-get update && \ 
    DEBIAN_FRONTEND=noninteractive apt-get install -y openjdk-11-jdk && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y ant && \
    apt-get clean;

# Fix certificate issues
RUN apt-get update && \
    apt-get install ca-certificates-java && \
    apt-get clean && \
    update-ca-certificates -f;

# Install required vscode dependencies for linux
RUN apt-get install libgtk-3-0 -y && \
    apt-get install -y libgbm-dev && \
    apt-get install libxss1 -y

# Setup JAVA_HOME
ENV JAVA_HOME /usr/lib/jvm/java-11-openjdk-amd64/
RUN export JAVA_HOME

ARG USERNAME
ARG TOKEN
ENV NPM_ACCESS_TOKEN=${TOKEN}

# Install node
ENV NODE_VERSION=16.3.0
RUN apt install -y curl
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version

# Clone ballerina-plugin-vscode
RUN git clone https://${USERNAME}:${TOKEN}@github.com/wso2-enterprise/ballerina-plugin-vscode.git

# Copy latest ballerina distribution to extractedDistribution directory
ENV BALLERINA_DISTRIBUTION_NAME=ballerina-swan-lake-preview5
RUN cd ballerina-plugin-vscode && mkdir extractedDistribution && \
    cp -r /ballerina/runtime /root/ballerina-plugin-vscode/extractedDistribution && \
    mv /root/ballerina-plugin-vscode/extractedDistribution/runtime/ /root/ballerina-plugin-vscode/extractedDistribution/${BALLERINA_DISTRIBUTION_NAME}/

# TODO Fix https://github.com/microsoft/vscode-extension-vscode/issues/143
RUN cd ballerina-plugin-vscode/ && npm i && export npm_package_engines_vscode=1.54.0 && node ./node_modules/vscode/bin/install

# Execute gradle build
RUN cd ballerina-plugin-vscode && apt-get install xvfb -y && xvfb-run --auto-servernum ./gradlew clean build
