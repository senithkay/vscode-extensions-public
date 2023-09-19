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
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { useChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
export const mapBuildStatus = (buildStatus) => {
    if (buildStatus) {
        const { status, conclusion } = buildStatus;
        switch (status) {
            case "started":
                return { text: "Started", color: "--vscode-charts-green" };
            case "completed":
                if (conclusion === "success") {
                    return { text: "Success", color: "--vscode-charts-green" };
                }
                return { text: "Failed", color: "--vscode-errorForeground" };
            case "Partially completed":
                return { text: "Partially Completed", color: "--vscode-charts-green" };
            case "in_progress":
                return { text: "In Progress", color: "--vscode-charts-orange" };
            case "failed":
                return { text: "Failed", color: "--vscode-errorForeground" };
            case "queued":
                return { text: "Queued", color: "--vscode-foreground" };
            default:
                return { text: "In Progress", color: "--vscode-charts-orange" };
        }
    }
    return { text: "Not Built", color: "--vscode-foreground" };
};
export const BuildStatusText = (props) => {
    var _a;
    const { buildStatus, handler, loading, localComponent } = props;
    const { choreoUrl, choreoProject, currentProjectOrg } = useChoreoWebViewContext();
    const componentBaseUrl = `${choreoUrl}/organizations/${currentProjectOrg === null || currentProjectOrg === void 0 ? void 0 : currentProjectOrg.handle}/projects/${choreoProject === null || choreoProject === void 0 ? void 0 : choreoProject.id}/components/${handler}`;
    const componentDeployLink = `${componentBaseUrl}/deploy`;
    const openBuildInfoInConsole = useCallback(() => {
        ChoreoWebViewAPI.getInstance().openExternal(componentDeployLink);
    }, [componentBaseUrl]);
    const buildStatusMappedValue = mapBuildStatus(buildStatus);
    return (React.createElement(React.Fragment, null, localComponent ? ("N/A") : loading ? ("Loading...") : (React.createElement(VSCodeLink, { onClick: openBuildInfoInConsole, style: { color: `var(${buildStatusMappedValue === null || buildStatusMappedValue === void 0 ? void 0 : buildStatusMappedValue.color})` } }, (_a = buildStatusMappedValue === null || buildStatusMappedValue === void 0 ? void 0 : buildStatusMappedValue.text) !== null && _a !== void 0 ? _a : "N/A"))));
};
//# sourceMappingURL=BuildStatusText.js.map