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
import React, { useCallback, useContext } from "react";
import { BuildStatus as BuildStatusType } from "@wso2-enterprise/choreo-core";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { ChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import { useSelectedOrg } from "../../hooks/use-selected-org";


export const mapBuildStatus = (
    status: string,
    conclusion: string | null,
): { text: string; color: string; } => {
    switch (status) {
        case 'started':
            return { text: "Started", color: '--vscode-charts-green' };
        case 'completed':
            if (conclusion === 'success') {
                return { text: "Success", color: '--vscode-charts-green' };
            }
            return { text: "Failed", color: '--vscode-errorForeground' };
        case 'Partially completed':
            return { text: "Partially Completed", color: '--vscode-charts-green' };
        case 'in_progress':
            return { text: "In Progress", color: '--vscode-charts-orange' };
        case 'failed':
            return { text: "Failed", color: '--vscode-errorForeground' };
        case 'queued':
            return { text: "Queued", color: '--vscode-foreground' };
        default:
            return { text: "In Progress", color: '--vscode-charts-orange' };
    }
};

export const BuildStatusText: React.FC<{
    buildStatus: BuildStatusType;
    handler: string;
    loading: boolean;
    localComponent: boolean;
}> = (props) => {
    const { buildStatus, handler, loading, localComponent } = props;
    const { choreoUrl, choreoProject } = useContext(ChoreoWebViewContext);
    const { selectedOrg } = useSelectedOrg();

    const componentBaseUrl = `${choreoUrl}/organizations/${selectedOrg?.handle}/projects/${choreoProject?.id}/components/${handler}`;
    const componentDeployLink = `${componentBaseUrl}/deploy`;

    const openBuildInfoInConsole = useCallback(() => {
        ChoreoWebViewAPI.getInstance().openExternal(componentDeployLink);
    }, [componentBaseUrl]);

    const buildStatusMappedValue = buildStatus && mapBuildStatus(buildStatus?.status, buildStatus?.conclusion as string);

    return (
        <>
            {localComponent ? (
                "N/A"
            ) : loading ? (
                "Loading..."
            ) : (
                <>
                    {buildStatusMappedValue && (
                        <>
                            <VSCodeLink onClick={openBuildInfoInConsole} style={{ color: buildStatusMappedValue.color }}>
                                {buildStatusMappedValue.text}
                            </VSCodeLink>
                        </>
                    )}
                    {!buildStatusMappedValue && <div>N/A</div>}
                </>
            )}
        </>
    );
};
