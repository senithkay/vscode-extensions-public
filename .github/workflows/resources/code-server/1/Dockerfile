FROM linuxserver/code-server:version-v3.12.0

# ARG REDIRECT_URI
# ARG CHOREO_SESSION_USERNAME
# ARG CHOREO_SESSION_TOKEN
# ARG CHOREO_SESSION_COOKIE
ARG mainHtml=/usr/local/share/.config/yarn/global/node_modules/code-server/src/browser/pages/vscode.html
ARG webViewMain=/usr/local/share/.config/yarn/global/node_modules/code-server/vendor/modules/code-oss-dev/out/vs/workbench/contrib/webview/browser/pre/main.js
ARG CODE_SERVER_VERSION=3.12.0

ENV LOW_CODE_MODE true
ENV CODE_SERVER_ENV true
# ENV VSCODE_CHOREO_DEPLOY_URI=${REDIRECT_URI} 
ENV OVERRIDE_CHOREO_AUTHENTICATION true
# ENV VSCODE_CHOREO_SESSION_USERNAME=${CHOREO_SESSION_USERNAME}
# ENV VSCODE_CHOREO_SESSION_TOKEN=${CHOREO_SESSION_TOKEN}
# ENV VSCODE_CHOREO_SESSION_COOKIE=${CHOREO_SESSION_COOKIE}

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
    sed -i '/<\/head>/i <!-- Loader Css -->\n<style>.hidden{display:none!important}div.loading{z-index:99;position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(70,70,70,.5)}.loading h4{color:#fff;text-align:center;top:-50px;position:relative}.loader{border:3px solid #edf0ff;border-top:3px solid #5463dc;border-radius:50%;width:28px;height:28px;animation:spin 1s linear infinite;position:absolute;left:50%;top:50%;-webkit-transform:translate(-50%,-50%);transform:translate(-50%,-50%)}@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}.uil-ring-css>div{position:absolute;display:block;width:160px;height:160px;top:20px;left:20px;border-radius:80px;box-shadow:0 6px 0 0 #fff;-ms-animation:uil-ring-anim 1s linear infinite;-moz-animation:uil-ring-anim 1s linear infinite;-webkit-animation:uil-ring-anim 1s linear infinite;-o-animation:uil-ring-anim 1s linear infinite;animation:uil-ring-anim 1s linear infinite}\n</style>' $mainHtml && \
    sed -i '/<\/body>/i <!-- Loader html -->\n<div class="loading"><div class="loader"><div></div></div></div>\n' $mainHtml && \
    sed -i 's/delete window.parent;//g' $webViewMain && \
    sed -i 's/delete window.top;//g' $webViewMain && \
    sed -i 's/delete window.frameElement;//g' $webViewMain && \
    sed -i '/<\/head>/i <!-- Hotjar Tracking Code for Choreo-prod -->\n<script>\n(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:2626534,hjsv:6};a=o.getElementsByTagName(\"head\")[0];r=o.createElement(\"script\");r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r);})(window,document,\"https://static.hotjar.com/c/hotjar-\",\".js?sv=\");\n</script>' $mainHtml  && \
    sed -i -e 's/{{CS_STATIC_BASE}}/https:\/\/choreo-shared-codeserver-cdne.azureedge.net\/code-server@'$CODE_SERVER_VERSION'/g' $mainHtml && \
    sed -i '/<\/head>/i <!-- Start VWO Async SmartCode -->\n<script type="text/javascript">\nwindow._vwo_code = window._vwo_code || (function(){\nvar account_id=547899,\nsettings_tolerance=2000,\nlibrary_tolerance=2500,\nuse_existing_jquery=false,\nis_spa=1,\nhide_element="body",\n\n/* DO NOT EDIT BELOW THIS LINE */\nf=false,d=document,code={use_existing_jquery:function(){return use_existing_jquery;},library_tolerance:function(){return library_tolerance;},finish:function(){if(!f){f=true;var a=d.getElementById("_vis_opt_path_hides");if(a)a.parentNode.removeChild(a);}},finished:function(){return f;},load:function(a){var b=d.createElement("script");b.src=a;b.type="text/javascript";b.innerText;b.onerror=function(){_vwo_code.finish();};d.getElementsByTagName("head")[0].appendChild(b);},init:function(){\nwindow.settings_timer=setTimeout(function () {_vwo_code.finish() },settings_tolerance);var a=d.createElement("style"),b=hide_element?hide_element+"{opacity:0 !important;filter:alpha(opacity=0) !important;background:none !important;}":"",h=d.getElementsByTagName("head")[0];a.setAttribute("id","_vis_opt_path_hides");a.setAttribute("type","text/css");if(a.styleSheet)a.styleSheet.cssText=b;else a.appendChild(d.createTextNode(b));h.appendChild(a);this.load("https://dev.visualwebsiteoptimizer.com/j.php?a="+account_id+"&u="+encodeURIComponent(d.URL)+"&f="+(+is_spa)+"&r="+Math.random());return settings_timer; }};window._vwo_settings_timer = code.init(); return code; }());\n</script>\n<!-- End VWO Async SmartCode -->' $mainHtml

RUN echo "{\n\"workbench.startupEditor\": \"none\",\n\"window.dialogStyle\": \"custom\",\n\"git.terminalAuthentication\": false}" > /config/data/User/settings.json
