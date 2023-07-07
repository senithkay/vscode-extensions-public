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
import React from "react";
import { Deployment, DeploymentStatus } from "@wso2-enterprise/choreo-core";

const DeploymentStatusMapping = {
    [DeploymentStatus.Active]: "Deployed",
    [DeploymentStatus.Suspended]: "Suspended",
    [DeploymentStatus.NotDeployed]: "Not Deployed",
    [DeploymentStatus.Error]: "Error",
    [DeploymentStatus.InProgress]: "In-progress",
};

export const DeploymentStatusText: React.FC<{
    localComponent: boolean;
    deployment: Deployment;
    loading: boolean;
}> = (props) => {
    const { deployment, localComponent, loading } = props;

    const deploymentStatusText: DeploymentStatus =
        (deployment?.deploymentStatus as DeploymentStatus) || DeploymentStatus.NotDeployed;

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
    return (
        <>
            {localComponent ? (
                "N/A"
            ) : loading ? (
                "Loading..."
            ) : (
                <div style={{ color: `var(${deploymentStatusColor})` }}>{DeploymentStatusMapping[deploymentStatusText]} </div>
            )}
        </>
    );
};
