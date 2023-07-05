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
import styled from "@emotion/styled";
import { Component, DeploymentStatus } from "@wso2-enterprise/choreo-core";

const Container = styled.div`
    display: flex;
    flex-direction: row;
`;


const DeploymentStatusMapping = {
    [DeploymentStatus.Active]: 'Deployed',
    [DeploymentStatus.Suspended]: 'Suspended',
    [DeploymentStatus.NotDeployed]: 'Not Deployed',
    [DeploymentStatus.Error]: 'Error',
    [DeploymentStatus.InProgress]: 'In-progress',
};

export const DeploymentStatusText: React.FC<{ enrichedComponent: Component }> = (props) => {
    const { enrichedComponent: { deployments, local } } = props;
    
    const deploymentStatus: DeploymentStatus =
        (deployments?.dev
            ?.deploymentStatusV2 as DeploymentStatus.NotDeployed) ||
        DeploymentStatus.NotDeployed;

    let deploymentStatusColor = '--vscode-foreground';
    switch (deploymentStatus as DeploymentStatus) {
        case DeploymentStatus.Active:
            deploymentStatusColor = '--vscode-charts-green';
            break;
        case DeploymentStatus.InProgress:
            deploymentStatusColor = '--vscode-charts-orange';
            break;
        case DeploymentStatus.Error:
            deploymentStatusColor = '--vscode-errorForeground';
            break;
        case DeploymentStatus.Suspended:
            deploymentStatusColor = '--vscode-charts-lines';
            break;
    }
    return (
        <Container>
            <div>Deployment:&nbsp;</div>
            <div style={{ color: `var(${deploymentStatusColor})` }}>{local ? 'N/A' : DeploymentStatusMapping[deploymentStatus]}</div>
        </Container>
    );
};
