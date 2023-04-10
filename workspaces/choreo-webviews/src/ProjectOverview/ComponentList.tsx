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

import { VSCodeDataGrid, VSCodeDataGridRow, VSCodeDataGridCell, VSCodeProgressRing, VSCodeButton, VSCodeTag, VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import { Component, DeploymentStatus, Repository, Status } from "@wso2-enterprise/choreo-core";
import { Codicon } from "../Codicon/Codicon";
import styled from "@emotion/styled";
import React, { useCallback } from "react";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { ContextMenu, MenuItem } from "../Commons/ContextMenu";

export interface ComponentListProps {
    components?: Component[];
    projectId?: string;
    orgName?: string;
    loading?: boolean;
    fetchingComponents?: boolean;
    isActive?: boolean;
    openSourceControl: () => void;
    onComponentDeleteClick: (component: Component) => void;
    handlePushComponentClick: (componentName: string) => void;
}

const InlineIcon = styled.span`
    vertical-align: sub;
    padding-left: 5px;
`;

const VSCodeDataGridCenterCell = styled(VSCodeDataGridCell)`
    align-self: center;
`

const VSCodeDataGridActionCell = styled(VSCodeDataGridCenterCell)`
    text-align: right;
`

const DeploymentStatusMapping = {
    [DeploymentStatus.Active]: 'Deployed',
    [DeploymentStatus.Suspended]: 'Suspended',
    [DeploymentStatus.NotDeployed]: 'Not Deployed',
    [DeploymentStatus.Error]: 'Error',
    [DeploymentStatus.InProgress]: 'In-progress',
    [Status.LocalOnly]: 'Locally only',
    [Status.UnavailableLocally]: 'Not Available Locally',
    [Status.ChoreoAndLocal]: 'Available Locally & in Choreo',
};

const mapBuildStatus = (
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

export function ComponentList(props: ComponentListProps) {
    const { orgName, projectId, components, openSourceControl, onComponentDeleteClick, handlePushComponentClick, loading, fetchingComponents, isActive } = props;

    if (props.components.length === 0 && fetchingComponents) {
        return <><VSCodeProgressRing /></>;
    } else if (props.components.length === 0) {
        return <><p><InlineIcon><Codicon name="info" /></InlineIcon> No components found. Clone & Open the project to create components.</p></>;
    }

    const onOpenConsoleClick = useCallback((url) => {
        ChoreoWebViewAPI.getInstance().openExternal(url);
    }, []);

    const pullComponent = useCallback(async (repository, selectedBranch, componentId) => {
        if (projectId && repository && selectedBranch) {
            const projectPath = await ChoreoWebViewAPI.getInstance().getProjectLocation(projectId);
            if (projectPath) {
                const isCloned = await ChoreoWebViewAPI.getInstance().getChoreoProjectManager().isRepoCloned({
                    repository: `${repository.organizationApp}/${repository.nameApp}`,
                    workspaceFilePath: projectPath,
                    branch: selectedBranch
                })
                if (isCloned) {
                    ChoreoWebViewAPI.getInstance().pullComponent({ componentId, projectId })
                } else {
                    await ChoreoWebViewAPI.getInstance().getChoreoProjectManager().cloneRepo({
                        repository: `${repository.organizationApp}/${repository.nameApp}`,
                        workspaceFilePath: projectPath,
                        branch: selectedBranch
                    });
                }
            } else {
                ChoreoWebViewAPI.getInstance().cloneChoreoProject(projectId);
            }
        }
    }, [projectId]);



    function getMenuItems(component: Component, componentOverviewLink: string, repoLink: string): MenuItem[] {
        // const menuItems = [
        //     { id: 'delete', label: <><Codicon name="trash" /> Delete Component</> , onClick: onComponentDeleteClick(component)},
        // ];
        // return menuItems;
        let menuItems = [];
        menuItems.push({ id: 'choreo-console', label: <><InlineIcon><Codicon name="github" /></InlineIcon> &nbsp; Open in Github</>, onClick: () => onOpenConsoleClick(repoLink) });
        if (!component.local) {
            menuItems.push({ id: 'choreo-console', label: <><InlineIcon><Codicon name="link-external" /></InlineIcon> &nbsp; Open in Choreo Console</>, onClick: () => onOpenConsoleClick(componentOverviewLink) });
        }
        menuItems.push({ id: 'delete', label: <><InlineIcon><Codicon name="trash" /></InlineIcon>  &nbsp; Delete Component</>, onClick: () => onComponentDeleteClick(component) });
        return menuItems;
    }

    return (
        <>
            <VSCodeDataGrid aria-label="Components">
                <VSCodeDataGridRow rowType="header">
                    <VSCodeDataGridCell cellType={"columnheader"} gridColumn="1">
                        Name
                    </VSCodeDataGridCell>
                    <VSCodeDataGridCell cellType={"columnheader"} gridColumn="2">
                        Version
                    </VSCodeDataGridCell>
                    <VSCodeDataGridCell cellType={"columnheader"} gridColumn="3">
                        Build
                    </VSCodeDataGridCell>
                    <VSCodeDataGridCell cellType={"columnheader"} gridColumn="4">
                        Deployment
                    </VSCodeDataGridCell>
                    <VSCodeDataGridActionCell cellType={"columnheader"} gridColumn="5">
                        Actions
                    </VSCodeDataGridActionCell>
                </VSCodeDataGridRow>
                {components?.map((component) => {
                    const repo: Repository = component.repository
                        ? component.repository
                        : {
                            nameApp: "-",
                            appSubPath: "-",
                            nameConfig: "-",
                            branch: "-",
                            branchApp: "-",
                            organizationApp: "-",
                            organizationConfig: "-",
                            isUserManage: false,
                        };

                    const componentBaseUrl = `https://console.choreo.dev/organizations/${orgName}/projects/${projectId}/components/${component.handler}`;
                    const componentOverviewLink = `${componentBaseUrl}/overview`;
                    const componentDeployLink = `${componentBaseUrl}/deploy`;
                    const repoLink = `https://github.com/${repo.organizationApp}/${repo.nameApp}/tree/${repo.branchApp}/${repo.appSubPath}`;


                    const deploymentStatus: DeploymentStatus =
                        (component.deployments?.dev
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

                    const buildStatusMappedValue = component.buildStatus && mapBuildStatus(component.buildStatus?.status, component.buildStatus?.conclusion);

                    return (
                        <VSCodeDataGridRow key={component.id || component.name}>
                            <VSCodeDataGridCenterCell gridColumn="1">
                                {component.name}
                            </VSCodeDataGridCenterCell>
                            <VSCodeDataGridCell gridColumn="2">
                                <VSCodeTag title={`Branch: ${repo.branchApp}`}>
                                    {component.version}
                                </VSCodeTag>
                            </VSCodeDataGridCell>
                            <VSCodeDataGridCenterCell gridColumn="3">
                                {component.local || !component.buildStatus ? (
                                    "N/A"
                                ) : (
                                    <>
                                        <VSCodeLink
                                            href={componentDeployLink} 
                                            style={{ color: `var(${buildStatusMappedValue.color})` }}
                                            title="Open component deployment page in Choreo Console"
                                        >
                                            {buildStatusMappedValue.text}
                                        </VSCodeLink>
                                        &nbsp;
                                        <VSCodeLink 
                                            href={`${repoLink}/commit/${component.buildStatus?.sourceCommitId}`} 
                                            style={{ color: `var(${buildStatusMappedValue.color})` }}
                                            title="Open commit in remote GitHub repository"
                                        >
                                            {`#${component.buildStatus?.sourceCommitId.substring(0, 9)}`}
                                        </VSCodeLink>
                                    </>
                                )}

                            </VSCodeDataGridCenterCell>
                            <VSCodeDataGridCenterCell gridColumn="4">
                                {component.local ? (
                                    "N/A"
                                ) : (
                                    <VSCodeLink 
                                        href={componentDeployLink} 
                                        style={{ color: `var(${deploymentStatusColor})` }}
                                        title="Open component deployment page in Choreo Console"
                                    >
                                        {DeploymentStatusMapping[deploymentStatus]}
                                    </VSCodeLink>
                                )}
                            </VSCodeDataGridCenterCell>
                            <VSCodeDataGridActionCell gridColumn="5">
                                {(component.hasDirtyLocalRepo ||
                                    component.hasUnPushedLocalCommits) && (
                                        <VSCodeButton
                                            appearance="icon"
                                            onClick={openSourceControl}
                                            title="Open source control view & sync changes"
                                        >
                                            <Codicon name="source-control" /> &nbsp; Commit & Push
                                        </VSCodeButton>
                                    )}
                                {component.isRemoteOnly && (
                                    <VSCodeButton
                                        appearance="icon"
                                        onClick={() =>
                                            pullComponent(
                                                component.repository,
                                                repo.branchApp,
                                                component.id
                                            )
                                        }
                                        disabled={loading || !isActive}
                                        title="Pull code from remote repository"
                                    >
                                        <Codicon name="cloud-download" /> &nbsp; Pull Component
                                    </VSCodeButton>
                                )}
                                {component.local &&
                                    !component.hasDirtyLocalRepo &&
                                    !component.hasUnPushedLocalCommits &&
                                    component.isInRemoteRepo && (
                                        <VSCodeButton
                                            appearance="icon"
                                            onClick={() => handlePushComponentClick(component.name)}
                                            title="Push code to remote repository"
                                            disabled={loading || !isActive}
                                        >
                                            <Codicon name="cloud-upload" /> &nbsp; Push Component
                                        </VSCodeButton>
                                    )}
                                <VSCodeButton
                                    appearance="icon"
                                    onClick={() => onComponentDeleteClick(component)}
                                    title="Delete Component"
                                    disabled={loading || !isActive}
                                >
                                    <Codicon name="trash" />
                                </VSCodeButton>
                                <ContextMenu items={getMenuItems(component, componentOverviewLink, repoLink)}></ContextMenu>
                            </VSCodeDataGridActionCell>
                        </VSCodeDataGridRow>
                    );
                })}
            </VSCodeDataGrid>
        </>
    );
}
