FROM linuxserver/code-server:version-v3.12.0

# ARG REDIRECT_URI
# ARG CHOREO_SESSION_USERNAME
# ARG CHOREO_SESSION_TOKEN
# ARG CHOREO_SESSION_COOKIE
ARG BALLERINA_DEB_URI
ARG BALLERINA_VSIX_URI
ARG BALLERINA_DEB_NAME
ARG BALLERINA_VSIX_NAME

ENV LOW_CODE_MODE true
ENV CODE_SERVER_ENV true
# ENV VSCODE_CHOREO_DEPLOY_URI=${REDIRECT_URI} 
ENV OVERRIDE_CHOREO_AUTHENTICATION true
# ENV VSCODE_CHOREO_SESSION_USERNAME=${CHOREO_SESSION_USERNAME}
# ENV VSCODE_CHOREO_SESSION_TOKEN=${CHOREO_SESSION_TOKEN}
# ENV VSCODE_CHOREO_SESSION_COOKIE=${CHOREO_SESSION_COOKIE}
ENV BALLERINA_STAGE_CENTRAL true

RUN sudo apt-get update && \
    sudo apt-get install -y wget && \
    sudo rm -rf /var/lib/apt/lists/* && \
    wget ${BALLERINA_DEB_URI} && \
    sudo dpkg -i ${BALLERINA_DEB_NAME} && \
    wget ${BALLERINA_VSIX_URI} && \
    code-server --user-data-dir /config/data --extensions-dir /config/extensions --install-extension ${BALLERINA_VSIX_NAME} && \
    wget "https://github.com/wso2/ballerina-plugin-vscode/releases/download/v0.0.1-preview/be5invis.toml-0.5.1.vsix" && \
    code-server --user-data-dir /config/data --extensions-dir /config/extensions --install-extension be5invis.toml-0.5.1.vsix && \
    rm ${BALLERINA_DEB_NAME} ${BALLERINA_VSIX_NAME} be5invis.toml-0.5.1.vsix

RUN echo "{\n\"workbench.startupEditor\": \"none\"\n}" > /config/data/User/settings.json
