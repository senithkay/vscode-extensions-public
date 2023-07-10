/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import { GHAppAuthStatus } from "@wso2-enterprise/choreo-client/lib/github/types";
import React, { useEffect, useState } from "react";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";

export function ChoreoAppInstaller() {

    const [ghStatus, setGHStatus] = useState<GHAppAuthStatus>({ status: "authorized" });

    useEffect(() => {
        const ghClient = ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient();
        ghClient.onGHAppAuthCallback((status) => {
            setGHStatus(status);
        });
        ghClient.checkAuthStatus();
        ghClient.status.then((status) => {
            setGHStatus(status);
        });
    }, []);

    const handleConfigureNewRepo = () => {
        setGHStatus({ status: "install-inprogress" });
        ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient().triggerInstallFlow();
        setGHStatus({ status: "installed" });
    };

    let loaderMessage;
    if (ghStatus.status === "install-inprogress") {
        loaderMessage = "Installing Choreo App...";
    } else {
        loaderMessage = "";
    }

    return (
        <>
            <span><VSCodeLink onClick={handleConfigureNewRepo}>Install app in GitHub</VSCodeLink> or Proceed to step 3.</span>
            
            {loaderMessage}
        </>
    );
}
