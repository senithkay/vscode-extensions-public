FROM linuxserver/code-server:version-v3.12.0

ARG GIT_PAT

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
    sudo apt-get install -y jq && \
    sudo apt-get install -y wget && \
    sudo apt-get install -y unzip && \
    sudo rm -rf /var/lib/apt/lists/* && \
    curl -s https://api.github.com/repos/ballerina-platform/ballerina-distribution/actions/artifacts\?per_page\=9 | jq '[.artifacts[] | {name : .name, archive_download_url : .archive_download_url}]' | jq -r '.[] | select (.name == "Linux Installer deb") | .archive_download_url' | wget -qi - -O ballerina.zip --header "Authorization:token ${GIT_PAT}" && \
    unzip -qq ./ballerina.zip && \
    sudo dpkg -i ballerina-linux-installer-x64-swan-lake-*.deb && \
    rm ballerina.zip ballerina-linux-installer-x64-swan-lake-*.deb

RUN curl -s https://api.github.com/repos/wso2/ballerina-plugin-vscode/releases | grep -wo -m1 "https.*ballerina.vsix" | wget -qi - -O ballerina.vsix && \
    code-server --user-data-dir /config/data --extensions-dir /config/extensions --install-extension ballerina.vsix && \
    wget "https://github.com/wso2/ballerina-plugin-vscode/releases/download/v0.0.1-preview/be5invis.toml-0.5.1.vsix" && \
    code-server --user-data-dir /config/data --extensions-dir /config/extensions --install-extension be5invis.toml-0.5.1.vsix && \
    rm ballerina.vsix be5invis.toml-0.5.1.vsix

RUN echo "{\n\"workbench.startupEditor\": \"none\"\n}" > /config/data/User/settings.json
