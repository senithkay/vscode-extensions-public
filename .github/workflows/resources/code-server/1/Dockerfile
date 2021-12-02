FROM linuxserver/code-server:version-v3.12.0

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
ENV BALLERINA_STAGE_CENTRAL true

RUN sudo apt-get update && \
    sudo apt-get install -y wget && \
    sudo rm -rf /var/lib/apt/lists/* && \
    curl -s https://api.github.com/repos/ballerina-platform/ballerina-distribution/releases | grep -wo -m1 "https.*ballerina-linux-installer-x64-swan-lake-.*deb" | wget -qi - -O ballerina.deb && \
    sudo dpkg -i ballerina.deb && \
    curl -s https://api.github.com/repos/wso2/ballerina-plugin-vscode/releases | grep -wo -m1 "https.*ballerina.vsix" | wget -qi - -O ballerina.vsix && \
    code-server --user-data-dir /config/data --extensions-dir /config/extensions --install-extension ballerina.vsix && \
    wget "https://github.com/wso2/ballerina-plugin-vscode/releases/download/v0.0.1-preview/be5invis.toml-0.5.1.vsix" && \
    code-server --user-data-dir /config/data --extensions-dir /config/extensions --install-extension be5invis.toml-0.5.1.vsix && \
    rm ballerina.deb ballerina.vsix be5invis.toml-0.5.1.vsix && \
    sed -i '/<\/head>/i <!-- Loader -->\n<script>\ndocument.onreadystatechange = function () { if ("complete" == document.readyState) { e = "[class*=activity-workbench-view-extension-diagram-explorer-]", t = function () { const e = document.querySelector(".all-done"); e && e.click(), document.querySelector(".loading").remove() }, o = 1e3, n = 9e3, c = Date.now(), function r() { if (null != document.querySelector(e)) return document.querySelector(e).click(), void t(); setTimeout(function () { n && Date.now() - c > n ? t() : r() }, o) }() } var e, t, o, n, c };\n</script>' $mainHtml && \
    sed -i '/<\/head>/i <!-- Loader Css -->\n<style>div.loading{z-index:99;position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(16,16,16,.5)}.loading h4{color:#fff;text-align:center;top:-50px;position:relative}@-webkit-keyframes uil-ring-anim{0%{-ms-transform:rotate(0);-moz-transform:rotate(0);-webkit-transform:rotate(0);-o-transform:rotate(0);transform:rotate(0)}100%{-ms-transform:rotate(360deg);-moz-transform:rotate(360deg);-webkit-transform:rotate(360deg);-o-transform:rotate(360deg);transform:rotate(360deg)}}@-webkit-keyframes uil-ring-anim{0%{-ms-transform:rotate(0);-moz-transform:rotate(0);-webkit-transform:rotate(0);-o-transform:rotate(0);transform:rotate(0)}100%{-ms-transform:rotate(360deg);-moz-transform:rotate(360deg);-webkit-transform:rotate(360deg);-o-transform:rotate(360deg);transform:rotate(360deg)}}@-moz-keyframes uil-ring-anim{0%{-ms-transform:rotate(0);-moz-transform:rotate(0);-webkit-transform:rotate(0);-o-transform:rotate(0);transform:rotate(0)}100%{-ms-transform:rotate(360deg);-moz-transform:rotate(360deg);-webkit-transform:rotate(360deg);-o-transform:rotate(360deg);transform:rotate(360deg)}}@-ms-keyframes uil-ring-anim{0%{-ms-transform:rotate(0);-moz-transform:rotate(0);-webkit-transform:rotate(0);-o-transform:rotate(0);transform:rotate(0)}100%{-ms-transform:rotate(360deg);-moz-transform:rotate(360deg);-webkit-transform:rotate(360deg);-o-transform:rotate(360deg);transform:rotate(360deg)}}@-moz-keyframes uil-ring-anim{0%{-ms-transform:rotate(0);-moz-transform:rotate(0);-webkit-transform:rotate(0);-o-transform:rotate(0);transform:rotate(0)}100%{-ms-transform:rotate(360deg);-moz-transform:rotate(360deg);-webkit-transform:rotate(360deg);-o-transform:rotate(360deg);transform:rotate(360deg)}}@-webkit-keyframes uil-ring-anim{0%{-ms-transform:rotate(0);-moz-transform:rotate(0);-webkit-transform:rotate(0);-o-transform:rotate(0);transform:rotate(0)}100%{-ms-transform:rotate(360deg);-moz-transform:rotate(360deg);-webkit-transform:rotate(360deg);-o-transform:rotate(360deg);transform:rotate(360deg)}}@-o-keyframes uil-ring-anim{0%{-ms-transform:rotate(0);-moz-transform:rotate(0);-webkit-transform:rotate(0);-o-transform:rotate(0);transform:rotate(0)}100%{-ms-transform:rotate(360deg);-moz-transform:rotate(360deg);-webkit-transform:rotate(360deg);-o-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes uil-ring-anim{0%{-ms-transform:rotate(0);-moz-transform:rotate(0);-webkit-transform:rotate(0);-o-transform:rotate(0);transform:rotate(0)}100%{-ms-transform:rotate(360deg);-moz-transform:rotate(360deg);-webkit-transform:rotate(360deg);-o-transform:rotate(360deg);transform:rotate(360deg)}}.uil-ring-css{margin:auto;position:absolute;top:0;left:0;bottom:0;right:0;width:200px;height:200px}.uil-ring-css>div{position:absolute;display:block;width:160px;height:160px;top:20px;left:20px;border-radius:80px;box-shadow:0 6px 0 0 #fff;-ms-animation:uil-ring-anim 1s linear infinite;-moz-animation:uil-ring-anim 1s linear infinite;-webkit-animation:uil-ring-anim 1s linear infinite;-o-animation:uil-ring-anim 1s linear infinite;animation:uil-ring-anim 1s linear infinite}\n</style>' $mainHtml && \
    sed -i '/<\/body>/i <!-- Loader html -->\n<div class="loading"><div class='uil-ring-css'><div></div><h4>Code Server is loading...</h4></div></div>\n' $mainHtml && \
    sed -i '/<\/head>/i <!-- Hotjar Tracking Code for Choreo-prod -->\n<script>\n(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:2626534,hjsv:6};a=o.getElementsByTagName(\"head\")[0];r=o.createElement(\"script\");r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r);})(window,document,\"https://static.hotjar.com/c/hotjar-\",\".js?sv=\");\n</script>' $mainHtml

RUN echo "{\n\"workbench.startupEditor\": \"none\"\n}" > /config/data/User/settings.json
