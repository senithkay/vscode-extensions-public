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
import React, { useCallback } from "react";
import { DeploymentStatus } from "@wso2-enterprise/choreo-core";
import { useChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
const DeploymentStatusMapping = {
    [DeploymentStatus.Active]: "Deployed",
    [DeploymentStatus.Suspended]: "Suspended",
    [DeploymentStatus.NotDeployed]: "Not Deployed",
    [DeploymentStatus.Error]: "Error",
    [DeploymentStatus.InProgress]: "In-progress",
};
export const DeploymentStatusText = (props) => {
    const { deployment, localComponent, loading, handler } = props;
    const { choreoUrl, choreoProject, currentProjectOrg } = useChoreoWebViewContext();
    const componentBaseUrl = `${choreoUrl}/organizations/${currentProjectOrg === null || currentProjectOrg === void 0 ? void 0 : currentProjectOrg.handle}/projects/${choreoProject === null || choreoProject === void 0 ? void 0 : choreoProject.id}/components/${handler}`;
    const componentDeployLink = `${componentBaseUrl}/deploy`;
    const deploymentStatusText = (deployment === null || deployment === void 0 ? void 0 : deployment.deploymentStatus) || DeploymentStatus.NotDeployed;
    let deploymentStatusColor = "--vscode-foreground";
    switch (deploymentStatusText) {
        case DeploymentStatus.Active:
            deploymentStatusColor = "--vscode-charts-green";
            break;
        case DeploymentStatus.InProgress:
            deploymentStatusColor = "--vscode-charts-orange";
            break;
        case DeploymentStatus.Error:
            deploymentStatusColor = "--vscode-errorForeground";
            break;
        case DeploymentStatus.Suspended:
            deploymentStatusColor = "--vscode-charts-lines";
            break;
    }
    const openBuildInfoInConsole = useCallback(() => {
        ChoreoWebViewAPI.getInstance().openExternal(componentDeployLink);
    }, [componentBaseUrl]);
    return (React.createElement(React.Fragment, null, localComponent ? ("N/A") : loading ? ("Loading...") : (React.createElement(VSCodeLink, { onClick: openBuildInfoInConsole, style: { color: `var(${deploymentStatusColor})` } }, DeploymentStatusMapping[deploymentStatusText]))));
};
//# sourceMappingURL=DeploymentStatusText.js.map