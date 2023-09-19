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
import styled from "@emotion/styled";
import { VSCodeProgressRing, VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import React, { useEffect, useState } from "react";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
const GhRepoSelectorActions = styled.div `
    display  : flex;
    flex-direction: row;
    gap: 10px;
`;
export function GithubAutherizer() {
    const [ghStatus, setGHStatus] = useState({ status: undefined });
    useEffect(() => {
        const ghClient = ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient();
        ghClient.onGHAppAuthCallback((status) => {
            setGHStatus(status);
        });
        ghClient.status.then((status) => {
            setGHStatus(status);
        });
    }, []);
    const handleAuthorizeWithGithub = () => {
        ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient().triggerAuthFlow();
    };
    const showAuthorizeButton = ghStatus.status === "not-authorized";
    const showLoader = ghStatus.status === "auth-inprogress" || ghStatus.status === "install-inprogress";
    let loaderMessage = "Authenticating...";
    if (ghStatus.status === "auth-inprogress") {
        loaderMessage = "Authorizing with Github...";
    }
    else if (ghStatus.status === "install-inprogress") {
        loaderMessage = "Installing Github App...";
    }
    return (React.createElement(React.Fragment, null,
        React.createElement(GhRepoSelectorActions, null,
            showAuthorizeButton && React.createElement("span", null,
                React.createElement(VSCodeLink, { onClick: handleAuthorizeWithGithub }, "Authorize with Github"),
                " to refresh repo list or to configure a new repository."),
            showLoader && loaderMessage,
            showLoader && React.createElement(VSCodeProgressRing, null))));
}
//# sourceMappingURL=GithubAutherizer.js.map