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

import { OPEN_GITHUB_REPO_PAGE_EVENT, Repository } from "@wso2-enterprise/choreo-core";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { Codicon } from "../../Codicon/Codicon";
import React from "react";

export const RepositoryLink = (props: { repo: Repository }) => {
    const { repo } = props;
    const gitHubBaseUrl = `https://github.com/${repo.organizationApp}/${repo.nameApp}`;
    const repoLink = `${gitHubBaseUrl}/tree/${repo.branchApp}${repo.appSubPath ? `/${repo.appSubPath}` : ''}`;

    const onOpenRepo = () => {
        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
            eventName: OPEN_GITHUB_REPO_PAGE_EVENT
        });
        ChoreoWebViewAPI.getInstance().openExternal(repoLink);
    };
    return (
        <VSCodeButton
            appearance="icon"
            onClick={onOpenRepo}
            title={"Open in github"}
            id="open-in-github-btn"
        >
            <Codicon name="github" />
        </VSCodeButton>
    );
};
