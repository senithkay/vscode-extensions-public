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
import { Component } from "@wso2-enterprise/choreo-core";
// import { ChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
// import { mapBuildStatus } from "../../ProjectOverview/ComponentList";
import { useEnrichComponent } from "../../hooks/use-enrich-component";
import { ProgressIndicator } from "./ProgressIndicator";

const Container = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
    margin: 5px;
`;

export const ComponentDetails = (props: { component: Component}) => {
    const { enrichedComponent, isLoadingComponent, isRefetchingComponent } = useEnrichComponent(props.component);
    // const { choreoUrl, selectedOrg, choreoProject } = useContext(ChoreoWebViewContext);

    if (isLoadingComponent || isRefetchingComponent || !enrichedComponent) {
        return <ProgressIndicator />;
    }
    // const repo: Repository = enrichedComponent.repository
    //     ? enrichedComponent.repository
    //     : {
    //         nameApp: "-",
    //         appSubPath: "-",
    //         nameConfig: "-",
    //         branch: "-",
    //         branchApp: "-",
    //         organizationApp: "-",
    //         organizationConfig: "-",
    //         isUserManage: false,
    //     };

    // const componentBaseUrl = `${choreoUrl}/organizations/${selectedOrg.name}/projects/${choreoProject?.id}/components/${enrichedComponent.handler}`;
    // const componentOverviewLink = `${componentBaseUrl}/overview`;
    // const componentDeployLink = `${componentBaseUrl}/deploy`;
    // const gitHubBaseUrl = `https://github.com/${repo.organizationApp}/${repo.nameApp}`;
    // const repoLink = `${gitHubBaseUrl}/tree/${repo.branchApp}${repo.appSubPath ? `/${repo.appSubPath}` : ''}`;


    // const deploymentStatus: DeploymentStatus =
    //     (enrichedComponent.deployments?.dev
    //         ?.deploymentStatusV2 as DeploymentStatus.NotDeployed) ||
    //     DeploymentStatus.NotDeployed;

    // let deploymentStatusColor = '--vscode-foreground';
    // switch (deploymentStatus as DeploymentStatus) {
    //     case DeploymentStatus.Active:
    //         deploymentStatusColor = '--vscode-charts-green';
    //         break;
    //     case DeploymentStatus.InProgress:
    //         deploymentStatusColor = '--vscode-charts-orange';
    //         break;
    //     case DeploymentStatus.Error:
    //         deploymentStatusColor = '--vscode-errorForeground';
    //         break;
    //     case DeploymentStatus.Suspended:
    //         deploymentStatusColor = '--vscode-charts-lines';
    //         break;
    // }

    // const buildStatusMappedValue = enrichedComponent.buildStatus && mapBuildStatus(enrichedComponent.buildStatus?.status, enrichedComponent.buildStatus?.conclusion);

    // const hasDirtyLocalRepo = enrichedComponent.hasDirtyLocalRepo || enrichedComponent.hasUnPushedLocalCommits;
    return (<Container>
        {(isLoadingComponent || isRefetchingComponent) && <ProgressIndicator />}
    </Container>)
};
