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

import { VSCodeDataGrid, VSCodeDataGridRow, VSCodeDataGridCell, VSCodeProgressRing, VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { Component, DeploymentStatus, Repository, Status } from "@wso2-enterprise/choreo-core";
import { Codicon } from "../Codicon/Codicon";
import styled from "@emotion/styled";
import React, { useCallback } from "react";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";

export interface ComponentListProps {
    components?: Component[];
    projectId?: string;
    orgName?: string;
    loading?: boolean;
    openSourceControl: () => void;
    onComponentDeleteClick: (component: Component) => void;
    handlePushComponentClick: (componentName: string) => void;
}

const InlineIcon = styled.span`
    vertical-align: sub;
    padding-left: 5px;
`;

const VSCodeDataGridActionCell = styled(VSCodeDataGridCell)`
    text-align: right;
`

export const DeploymentStatusMapping = {
    [DeploymentStatus.Active]: 'Deployed',
    [DeploymentStatus.Suspended]: 'Suspended',
    [DeploymentStatus.NotDeployed]: 'Not Deployed',
    [DeploymentStatus.Error]: 'Error',
    [DeploymentStatus.InProgress]: 'In-progress',
    [Status.LocalOnly]: 'Locally only',
    [Status.UnavailableLocally]: 'Not Available Locally',
    [Status.ChoreoAndLocal]: 'Available Locally & in Choreo',
};

export function ComponentList(props: ComponentListProps) {
    const { orgName, projectId, components, openSourceControl, onComponentDeleteClick, handlePushComponentClick, loading } = props;

    if (!props.components) {
        return <><VSCodeProgressRing /></>;
    }

    if (props.components.length === 0) {
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
                        Repo
                    </VSCodeDataGridCell>
                    <VSCodeDataGridCell cellType={"columnheader"} gridColumn="4">
                        Branch
                    </VSCodeDataGridCell>
                    <VSCodeDataGridCell cellType={"columnheader"} gridColumn="5">
                        Sub Path
                    </VSCodeDataGridCell>
                    <VSCodeDataGridCell cellType={"columnheader"} gridColumn="6">
                        Status
                    </VSCodeDataGridCell>
                    <VSCodeDataGridCell cellType={"columnheader"} gridColumn="7">
                        Deployment
                    </VSCodeDataGridCell>
                    <VSCodeDataGridActionCell cellType={"columnheader"} gridColumn="8">
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

                    const repoName =
                        repo.organizationApp === "-"
                            ? "-"
                            : repo.organizationApp + "/" + repo.nameApp;
                    const repoLink =
                        repoName !== "-" ? `https://github.com/${repoName}` : "";

                    let statusText: Status = Status.ChoreoAndLocal;
                    if (component.local) {
                        statusText = Status.LocalOnly;
                    } else if (component.isRemoteOnly) {
                        statusText = Status.UnavailableLocally;
                    }

                    const deploymentStatus: DeploymentStatus =
                        (component.deployments?.dev
                            ?.deploymentStatusV2 as DeploymentStatus.NotDeployed) ||
                        DeploymentStatus.NotDeployed;

                    return (
                        <VSCodeDataGridRow key={component.id || component.name}>
                            <VSCodeDataGridCell gridColumn="1">
                                {component.name}
                            </VSCodeDataGridCell>
                            <VSCodeDataGridCell gridColumn="2">
                                {component.version}
                            </VSCodeDataGridCell>
                            <VSCodeDataGridCell gridColumn="3">
                                {repoLink && <a href={repoLink}>{repoName}</a>}
                            </VSCodeDataGridCell>
                            <VSCodeDataGridCell gridColumn="4">
                                {repo.branchApp}
                            </VSCodeDataGridCell>
                            <VSCodeDataGridCell gridColumn="5">
                                {repo.appSubPath === "-" ? "-" : "/" + repo.appSubPath}
                            </VSCodeDataGridCell>
                            <VSCodeDataGridCell gridColumn="6">
                                {DeploymentStatusMapping[statusText]}
                            </VSCodeDataGridCell>
                            <VSCodeDataGridCell gridColumn="7">
                                {component.local ? (
                                    DeploymentStatusMapping[deploymentStatus]
                                ) : (
                                    <a href={componentDeployLink}>
                                        {DeploymentStatusMapping[deploymentStatus]}
                                    </a>
                                )}
                            </VSCodeDataGridCell>
                            <VSCodeDataGridActionCell gridColumn="8" className="">
                                {(component.hasDirtyLocalRepo ||
                                    component.hasUnPushedLocalCommits) && (
                                        <VSCodeButton
                                            appearance="icon"
                                            onClick={openSourceControl}
                                            title="Open source control view & sync changes"
                                        >
                                            <Codicon name="source-control" />
                                        </VSCodeButton>
                                    )}
                                {!component.local && (
                                    <VSCodeButton
                                        appearance="icon"
                                        onClick={() => onOpenConsoleClick(componentOverviewLink)}
                                        title="Open component overview in Choreo Console"
                                    >
                                        <Codicon name="link-external" />
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
                                        title="Pull code from remote repository"
                                    >
                                        <Codicon name="cloud-download" />
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
                                            disabled={loading}
                                        >
                                            <Codicon name="cloud-upload" />
                                        </VSCodeButton>
                                    )}
                                <VSCodeButton
                                    appearance="icon"
                                    onClick={() => onComponentDeleteClick(component)}
                                    title="Delete Component"
                                    disabled={loading}
                                >
                                    <Codicon name="trash" />
                                </VSCodeButton>
                            </VSCodeDataGridActionCell>
                        </VSCodeDataGridRow>
                    );
                })}
            </VSCodeDataGrid>
        </>
    );
}
