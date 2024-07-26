/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import { GHAppAuthStatus } from "@wso2-enterprise/choreo-client/lib/github/types";
import React, { useEffect, useState } from "react";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";

export interface ChoreoAppInstallerProps {
    onAppInstallation: () => void;
    orgId: number;
}

export function ChoreoAppInstaller(props: ChoreoAppInstallerProps) {
    const { onAppInstallation, orgId } = props;

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

    const handleConfigureNewRepo = async () => {
        setGHStatus({ status: "install-inprogress" });
        await ChoreoWebViewAPI.getInstance().setChoreoInstallOrg(orgId);
        const success =  await ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient().triggerInstallFlow();
        await ChoreoWebViewAPI.getInstance().clearChoreoInstallOrg();
        if (success) {
            setGHStatus({ status: "installed" });
            onAppInstallation();
        } else {
            setGHStatus({ status: "error" });
        }
    };

    let loaderMessage;
    if (ghStatus.status === "install-inprogress") {
        loaderMessage = "Installing Choreo App...";
    } else {
        loaderMessage = "";
    }

    return (
        <>
            <span>Install the <VSCodeLink onClick={handleConfigureNewRepo}>Choreo Application</VSCodeLink> to the repository.</span>
            {loaderMessage}
        </>
    );
}
