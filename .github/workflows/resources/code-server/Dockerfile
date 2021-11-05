FROM linuxserver/code-server:version-v3.12.0

# ARG REDIRECT_URI
# ARG CHOREO_SESSION_USERNAME
# ARG CHOREO_SESSION_TOKEN
# ARG CHOREO_SESSION_COOKIE

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
    curl -s https://api.github.com/repos/ballerina-platform/ballerina-distribution/releases | grep -wo -m1 "https.*ballerina-linux-installer-x64-swan-lake-.*deb" | wget -qi - -O ballerina.deb && \
    sudo dpkg -i ballerina.deb && \
    curl -s https://api.github.com/repos/wso2/ballerina-plugin-vscode/releases | grep -wo -m1 "https.*ballerina.vsix" | wget -qi - -O ballerina.vsix && \
    code-server --user-data-dir /config/data --extensions-dir /config/extensions --install-extension ballerina.vsix && \
    wget "https://github.com/wso2/ballerina-plugin-vscode/releases/download/v0.0.1-preview/Tino.simple-rest-client-1.4.2.vsix" && \
    code-server --user-data-dir /config/data --extensions-dir /config/extensions --install-extension Tino.simple-rest-client-1.4.2.vsix && \
    wget "https://github.com/wso2/ballerina-plugin-vscode/releases/download/v0.0.1-preview/be5invis.toml-0.5.1.vsix" && \
    code-server --user-data-dir /config/data --extensions-dir /config/extensions --install-extension be5invis.toml-0.5.1.vsix && \
    rm ballerina.deb ballerina.vsix Tino.simple-rest-client-1.4.2.vsix be5invis.toml-0.5.1.vsix
