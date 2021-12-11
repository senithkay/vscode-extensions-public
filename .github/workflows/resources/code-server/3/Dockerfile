FROM linuxserver/code-server:version-v3.12.0

ARG GIT_PAT

# ARG REDIRECT_URI
# ARG CHOREO_SESSION_USERNAME
# ARG CHOREO_SESSION_TOKEN
# ARG CHOREO_SESSION_COOKIE
ARG mainHtml=/usr/local/share/.config/yarn/global/node_modules/code-server/src/browser/pages/vscode.html

ENV LOW_CODE_MODE true
ENV CODE_SERVER_ENV true
# ENV VSCODE_CHOREO_DEPLOY_URI=${REDIRECT_URI} 
ENV OVERRIDE_CHOREO_AUTHENTICATION true
# ENV VSCODE_CHOREO_SESSION_USERNAME=${CHOREO_SESSION_USERNAME}
# ENV VSCODE_CHOREO_SESSION_TOKEN=${CHOREO_SESSION_TOKEN}
# ENV VSCODE_CHOREO_SESSION_COOKIE=${CHOREO_SESSION_COOKIE}

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
    rm ballerina.vsix be5invis.toml-0.5.1.vsix && \
    sed -i '/<\/head>/i <!-- Loader -->\n<script>\ndocument.onreadystatechange=function(){if("complete"==document.readyState){e="a[title=\\"Show Source\\"]",o=function(){document.querySelector(".loading").remove()},t=500,n=15e3,c=Date.now(),function u(){if(null!=document.querySelector(e))return void o();setTimeout(function(){n&&Date.now()-c>n?o():u()},t)}()}var e,o,t,n,c};\n</script>' $mainHtml && \
    sed -i '/<\/head>/i <!-- Loader Css -->\n<style>.hidden{display:none!important}div.loading{z-index:99;position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(70,70,70,.5)}.loading h4{color:#fff;text-align:center;top:-50px;position:relative}.loader{border:3px solid #edf0ff;border-top:3px solid #5463dc;border-radius:50%;width:28px;height:28px;animation:spin 1s linear infinite;position:absolute;left:50%;top:50%;-webkit-transform:translate(-50%,-50%);transform:translate(-50%,-50%)}@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}.uil-ring-css>div{position:absolute;display:block;width:160px;height:160px;top:20px;left:20px;border-radius:80px;box-shadow:0 6px 0 0 #fff;-ms-animation:uil-ring-anim 1s linear infinite;-moz-animation:uil-ring-anim 1s linear infinite;-webkit-animation:uil-ring-anim 1s linear infinite;-o-animation:uil-ring-anim 1s linear infinite;animation:uil-ring-anim 1s linear infinite}\n</style>' $mainHtml && \
    sed -i '/<\/body>/i <!-- Loader html -->\n<div class="loading"><div class='loader'><div></div></div></div>\n' $mainHtml 

RUN echo "{\n\"workbench.startupEditor\": \"none\"\n\"window.dialogStyle\": \"custom\"}" > /config/data/User/settings.json
