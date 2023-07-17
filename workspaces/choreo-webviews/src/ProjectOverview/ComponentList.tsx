// TODO: Delete this component
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

import { VSCodeDataGrid, VSCodeDataGridRow, VSCodeDataGridCell, VSCodeButton, VSCodeTag, VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import { Component, DeploymentStatus, GitProvider, OPEN_CONSOLE_COMPONENT_OVERVIEW_PAGE_EVENT, OPEN_GITHUB_REPO_PAGE_EVENT, PULL_REMOTE_COMPONENT_FROM_OVERVIEW_PAGE_EVENT, Repository } from "@wso2-enterprise/choreo-core";
import { Codicon } from "../Codicon/Codicon";
import styled from "@emotion/styled";
import React, { useCallback } from "react";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { ContextMenu, MenuItem } from "../Commons/ContextMenu";
import { useMutation } from "@tanstack/react-query";

export interface ComponentListProps {
    components?: Component[];
    projectId?: string;
    orgName?: string;
    loading?: boolean;
    fetchingComponents?: boolean;
    isActive?: boolean;
    reachedChoreoLimit?: boolean;
    choreoUrl?: string;
    openSourceControl: () => void;
    onComponentDeleteClick: (component: Component) => void;
    handlePushComponentClick: (componentName: string) => void;
    refreshComponentStatus: () => void;
}

const InlineIcon = styled.span`
    vertical-align: sub;
    padding-left: 5px;
`;

const VSCodeDataGridCenterCell = styled(VSCodeDataGridCell)`
    align-self: center;
    &:focus,&:active  {
        border: none;
        background: none;
    }
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
};

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

export function ComponentList(props: ComponentListProps) {
    const {
        orgName,
        projectId,
        components,
        openSourceControl,
        onComponentDeleteClick,
        handlePushComponentClick,
        refreshComponentStatus,
        loading,
        fetchingComponents,
        isActive,
        reachedChoreoLimit,
        choreoUrl
    } = props;


    const onOpenConsoleClick = useCallback((url) => {
        ChoreoWebViewAPI.getInstance().openExternal(url);
    }, []);

    const { mutate: pullComponent, isLoading: isPulling } = useMutation({
        mutationFn: async ({ repository, branchName, componentId }: { repository: Repository; branchName: string; componentId: string }) => {
            if (projectId && repository && branchName) {
                const projectPath = await ChoreoWebViewAPI.getInstance().getProjectLocation(projectId);
                if (projectPath) {
                    const isCloned = await ChoreoWebViewAPI.getInstance().getChoreoProjectManager().isRepoCloned({
                        repository: `${repository.organizationApp}/${repository.nameApp}`,
                        workspaceFilePath: projectPath,
                        branch: branchName,
                        gitProvider: repository.gitProvider
                    })
                    if (isCloned) {
                        await ChoreoWebViewAPI.getInstance().pullComponent({ componentId, projectId })
                    } else {
                        await ChoreoWebViewAPI.getInstance().getChoreoProjectManager().cloneRepo({
                            repository: `${repository.organizationApp}/${repository.nameApp}`,
                            workspaceFilePath: projectPath,
                            branch: branchName,
                            gitProvider: repository.gitProvider
                        });
                    }
                } else {
                    await ChoreoWebViewAPI.getInstance().cloneChoreoProject(projectId);
                }
            }
        },
        onSuccess: () => refreshComponentStatus(),
    });

    function getMenuItems(component: Component, componentOverviewLink: string, repoLink: string): MenuItem[] {
        const menuItems = [];
        menuItems.push({
            id: "github-remote",
            label: (
                <>
                    <InlineIcon>
                        <Codicon name="github" />
                    </InlineIcon>{" "}
                    &nbsp; Open in Github
                </>
            ),
            onClick: () => {
                ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
                    eventName: OPEN_GITHUB_REPO_PAGE_EVENT,
                    properties: {
                        component: component?.name,
                    }
                });
                onOpenConsoleClick(repoLink);
            },
        });
        if (!component.local) {
            menuItems.push({
                id: "choreo-console",
                label: (
                    <>
                        <InlineIcon>
                            <Codicon name="link-external" />
                        </InlineIcon>{" "}
                        &nbsp; Open in Choreo Console
                    </>
                ),
                onClick: () => {
                    ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
                        eventName: OPEN_CONSOLE_COMPONENT_OVERVIEW_PAGE_EVENT,
                        properties: {
                            component: component?.name,
                        }
                    });
                    onOpenConsoleClick(componentOverviewLink);
                },
            });
        }
        menuItems.push({
            id: "delete",
            label: (
                <>
                    <InlineIcon>
                        <Codicon name="trash" />
                    </InlineIcon>{" "}
                    &nbsp; Delete Component
                </>
            ),
            onClick: () => onComponentDeleteClick(component),
            disabled: !isActive,
        });
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
                {components?.map((component, index) => {
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
                            gitProvider: GitProvider.GITHUB,
                            bitbucketCredentialId: ''
                        };

                    const componentBaseUrl = `${choreoUrl}/organizations/${orgName}/projects/${projectId}/components/${component.handler}`;
                    const componentOverviewLink = `${componentBaseUrl}/overview`;
                    const componentDeployLink = `${componentBaseUrl}/deploy`;

                    const bitbucketUrl = `https://bitbucket.org`;
                    let repoUrl = `https://github.com`;
                    let branchSeparator = `tree`;
                    switch (repo.gitProvider) {
                        case GitProvider.BITBUCKET:
                            repoUrl = bitbucketUrl;
                            branchSeparator = `src`;
                            break;
                    }
                
                    const providerBaseUrl = `${repoUrl}/${repo.organizationApp}/${repo.nameApp}`;
                    const repoLink = `${providerBaseUrl}/${branchSeparator}/${repo.branchApp}${repo.appSubPath ? `/${repo.appSubPath}` : ''}`;

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

                    const hasDirtyLocalRepo = component.hasDirtyLocalRepo || component.hasUnPushedLocalCommits;

                    return (
                        <VSCodeDataGridRow key={component.id || component.name}>
                            <VSCodeDataGridCenterCell gridColumn="1">
                                {component.displayName}
                            </VSCodeDataGridCenterCell>
                            <VSCodeDataGridCenterCell gridColumn="2">
                                <VSCodeTag title={`Branch: ${repo.branchApp}`}>
                                    {component.version}
                                </VSCodeTag>
                            </VSCodeDataGridCenterCell>
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
                                        &nbsp;|&nbsp;
                                        <VSCodeLink
                                            href={`${providerBaseUrl}/commit/${component.buildStatus?.sourceCommitId}`}
                                            style={{ color: `var(${buildStatusMappedValue.color})` }}
                                            title={`Open commit in remote ${repo.gitProvider} repository`}
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
                                {hasDirtyLocalRepo && (
                                    <VSCodeButton
                                        appearance="icon"
                                        onClick={openSourceControl}
                                        title="Open source control view & sync changes"
                                    >
                                        <Codicon name="source-control" /> &nbsp; Commit & Push
                                    </VSCodeButton>
                                )}
                                {component.isRemoteOnly && isActive && !hasDirtyLocalRepo && (
                                    <VSCodeButton
                                        appearance="icon"
                                        onClick={() =>{
                                            ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
                                                eventName: PULL_REMOTE_COMPONENT_FROM_OVERVIEW_PAGE_EVENT,
                                                properties: {
                                                    component: component?.name,
                                                },
                                            })
                                            pullComponent({
                                                repository: component.repository,
                                                branchName: repo.branchApp,
                                                componentId: component.id
                                            });
                                        }}
                                        disabled={loading || isPulling}
                                        title="Pull code from remote repository"
                                    >
                                        <Codicon name="cloud-download" /> &nbsp; Pull Component
                                    </VSCodeButton>
                                )}
                                {component.local && !hasDirtyLocalRepo && (
                                    <VSCodeButton
                                        appearance="icon"
                                        onClick={() => handlePushComponentClick(component.name)}
                                        title={reachedChoreoLimit ? "Please upgrade your tier to push to Choreo" : "Push code to remote repository"}
                                        disabled={fetchingComponents || loading || !isActive || reachedChoreoLimit}
                                    >
                                        <Codicon name="cloud-upload" /> &nbsp; Push to Choreo
                                    </VSCodeButton>
                                )}
                                <ContextMenu items={getMenuItems(component, componentOverviewLink, repoLink)} index={index}></ContextMenu>
                            </VSCodeDataGridActionCell>
                        </VSCodeDataGridRow>
                    );
                })}
            </VSCodeDataGrid>
        </>
    );
}
