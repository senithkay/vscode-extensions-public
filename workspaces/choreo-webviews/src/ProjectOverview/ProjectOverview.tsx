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

import {
    VSCodeButton,
    VSCodeProgressRing,
} from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import React, { useCallback, useMemo } from "react";
import { Component } from "@wso2-enterprise/choreo-core";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { ComponentList } from "./ComponentList";
import { Codicon } from "../Codicon/Codicon";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const WizardContainer = styled.div`
    width: 100%;
    display  : flex;
    flex-direction: column;
    padding: 20px;
`;

const HeaderContainer = styled.div`
    display  : flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
`;

const ActionContainer = styled.div`
    display  : flex;
    flex-direction: row;
    gap: 10px;
`;

const ComponentsHeader = styled.div`
    display  : flex;
    flex-direction: row;
    gap: 10px;
    align-items: center;
`;

const ActiveLabel = styled.div`
    font-size  : 12px;
    display  : inline-block;
`;

const InlineIcon = styled.span`
    vertical-align: sub;
    padding-left: 5px;
`;

export interface ProjectOverviewProps {
    projectId?: string;
    orgName?: string;
}

export function ProjectOverview(props: ProjectOverviewProps) {
    const { orgName, projectId } = props;
    const queryClient = useQueryClient();

    const { data: project } = useQuery({
        queryKey: ["overview_project", projectId, orgName],
        queryFn: () => ChoreoWebViewAPI.getInstance().getAllProjects(),
        select: (fetchedProjects) =>
            fetchedProjects.find((i) => i.id === projectId),
    });

    const {
        data: components = [],
        isLoading: loadingComponents,
        refetch: refetchComponents,
    } = useQuery({
        queryKey: ["overview_component_list", projectId, orgName],
        queryFn: async () => {
            const components = await ChoreoWebViewAPI.getInstance().getComponents(projectId);
            queryClient.setQueryData(["overview_component_list", projectId, orgName], components);
            return ChoreoWebViewAPI.getInstance().getEnrichedComponents(projectId);
        },
        onError: (error: Error) => ChoreoWebViewAPI.getInstance().showErrorMsg(error.message),
        refetchInterval: 15000, // Refetch component list every 15 seconds
    });

    const { data: isActive } = useQuery({
        queryKey: ["overview_project_isActive", projectId, orgName],
        queryFn: () => ChoreoWebViewAPI.getInstance().getChoreoProject(),
        select: (p) => p?.id === projectId,
    });

    const { data: location } = useQuery({
        queryKey: ["overview_project_location", projectId, orgName],
        queryFn: () => ChoreoWebViewAPI.getInstance().getProjectLocation(projectId),
    });

    const { mutate: handleDeleteComponentClick, isLoading: deletingComponent } = useMutation({
        mutationFn: (component: Component) => ChoreoWebViewAPI.getInstance().deleteComponent({ component, projectId }),
        onError: (error: Error) => ChoreoWebViewAPI.getInstance().showErrorMsg(error.message),
        onSuccess: () => refetchComponents(),
    });

    const { mutate: handlePushComponentClick, isLoading: pushingSingleComponent } = useMutation({
        mutationFn: (componentName: string) => ChoreoWebViewAPI.getInstance().pushLocalComponentToChoreo({ projectId, componentName }),
        onError: (error: Error) => ChoreoWebViewAPI.getInstance().showErrorMsg(error.message),
        onSuccess: () => refetchComponents(),
    });

    const { mutate: handleRefreshComponentsClick, isLoading: reloadingRegistry } = useMutation({
        mutationFn: () => ChoreoWebViewAPI.getInstance().triggerCmd("wso2.choreo.projects.registry.refresh"),
        onSuccess: () => refetchComponents(),
    });

    const { mutate: handlePushToChoreoClick, isLoading: pushingComponent } =
        useMutation({
            mutationFn: () => ChoreoWebViewAPI.getInstance().pushLocalComponentsToChoreo(projectId),
            onError: (error: Error) => ChoreoWebViewAPI.getInstance().showErrorMsg(error.message),
            onSuccess: () => refetchComponents(),
        });

    const handleCloneProjectClick = useCallback(() => {
        ChoreoWebViewAPI.getInstance().cloneChoreoProject(project ? project.id : "");
    }, [project]);

    const handleOpenProjectClick = useCallback(() => {
        ChoreoWebViewAPI.getInstance().openChoreoProject(project ? project.id : "");
    }, [project]);

    const handleOpenArchitectureViewClick = useCallback(() => {
        ChoreoWebViewAPI.getInstance().openArchitectureView();
    }, []);

    const handleOpenChoreoArchitectureViewClick = useCallback(() => {
        ChoreoWebViewAPI.getInstance().triggerCmd("wso2.choreo.architecture.view", orgName, projectId);
    }, [orgName, projectId]);

    const consoleLink = `https://console.choreo.dev/organizations/${orgName}/projects/${project?.id}`;

    const onOpenConsoleClick = useCallback(() => {
        ChoreoWebViewAPI.getInstance().openExternal(consoleLink);
    }, [consoleLink]);

    const handleCreateComponentClick = useCallback(() => {
        ChoreoWebViewAPI.getInstance().triggerCmd("wso2.choreo.component.create");
    }, []);

    const handleOpenSourceControlClick = useCallback(() => {
        ChoreoWebViewAPI.getInstance().triggerCmd("workbench.scm.focus");
    }, []);

    const hasLocalComponents = useMemo(
        () => components?.some((component) => component.local),
        [components]
    );

    /** Has components with local changes or unpushed commits */
    const componentsOutOfSync = useMemo(() => {
        return components?.some(
            (component) => component.hasDirtyLocalRepo || component.hasUnPushedLocalCommits
        );
    }, [components]);

    /** Every local components is without any local git changes to commit/push & valid path in remote repo. These components can be pushed to Choreo */
    const hasPushableComponents = useMemo(() => {
        const localOnlyComponents = components.filter(
            (component) => component.local
        );
        if (localOnlyComponents.length === 0) {
            return false;
        }
        return localOnlyComponents?.every(
            (component) =>
                !component.hasDirtyLocalRepo &&
                !component.hasUnPushedLocalCommits &&
                component.isInRemoteRepo
        );
    }, [components]);

    return (
        <>
            <WizardContainer>
                <HeaderContainer>
                    <h1>{project?.name}</h1>
                    <VSCodeButton
                        appearance="icon"
                        title="Open in Choreo Console"
                        onClick={onOpenConsoleClick}
                    >
                        <Codicon name="link-external" />
                    </VSCodeButton>
                    {isActive && <ActiveLabel>(Currently Opened)</ActiveLabel>}
                </HeaderContainer>
                {location === undefined && (
                    <>
                        <p>
                            <InlineIcon>
                                <Codicon name="info" />
                            </InlineIcon>{" "}
                            To open the project clone in to your local machine
                        </p>
                        <ActionContainer>
                            <VSCodeButton
                                appearance="primary"
                                onClick={handleCloneProjectClick}
                            >
                                <Codicon name="cloud-download" />
                                &nbsp;Clone Project
                            </VSCodeButton>
                            <VSCodeButton appearance="secondary" disabled={true}>
                                Open Project
                            </VSCodeButton>
                            <VSCodeButton
                                appearance="secondary"
                                disabled={components?.length <= 0}
                                onClick={handleOpenChoreoArchitectureViewClick}
                            >
                                Architecture View
                            </VSCodeButton>
                        </ActionContainer>
                    </>
                )}
                {location !== undefined && !isActive && (
                    <>
                        <p>
                            <InlineIcon>
                                <Codicon name="info" />
                            </InlineIcon>{" "}
                            Found a local copy of the project at `{location}`.{" "}
                        </p>
                        <ActionContainer>
                            <VSCodeButton appearance="secondary" disabled={true}>
                                <Codicon name="cloud-download" />
                                &nbsp;Clone Project
                            </VSCodeButton>
                            <VSCodeButton
                                appearance="primary"
                                onClick={handleOpenProjectClick}
                            >
                                Open Project
                            </VSCodeButton>
                            <VSCodeButton appearance="secondary" disabled={true}>
                                Architecture View
                            </VSCodeButton>
                        </ActionContainer>
                    </>
                )}
                {isActive && (
                    <>
                        <p>
                            <InlineIcon>
                                <Codicon name="info" />
                            </InlineIcon>{" "}
                            Open the architecture view to add components.{" "}
                        </p>
                        <ActionContainer>
                            <VSCodeButton appearance="secondary" disabled={true}>
                                <Codicon name="cloud-download" />
                                &nbsp;Clone Project
                            </VSCodeButton>
                            <VSCodeButton appearance="secondary" disabled={true}>
                                Open Project
                            </VSCodeButton>
                            <VSCodeButton
                                appearance="primary"
                                onClick={handleOpenArchitectureViewClick}
                            >
                                Architecture View
                            </VSCodeButton>
                        </ActionContainer>
                    </>
                )}

                <ComponentsHeader>
                    <h2>Components</h2>
                    <VSCodeButton
                        appearance="icon"
                        onClick={handleCreateComponentClick}
                        disabled={!isActive}
                        title="Add Component"
                    >
                        <Codicon name="plus" />
                    </VSCodeButton>
                </ComponentsHeader>
                <ComponentList
                    components={components}
                    projectId={projectId}
                    orgName={orgName}
                    openSourceControl={handleOpenSourceControlClick}
                    onComponentDeleteClick={handleDeleteComponentClick}
                    handlePushComponentClick={handlePushComponentClick}
                    loading={reloadingRegistry || loadingComponents || pushingComponent || pushingSingleComponent || deletingComponent}
                />

                {(reloadingRegistry || loadingComponents) ? (
                    <VSCodeProgressRing />
                ) : (
                    <>
                        {hasPushableComponents && (
                            <>
                                <p>
                                    <InlineIcon>
                                        <Codicon name="lightbulb" />
                                    </InlineIcon>
                                    &nbsp; Some components are not created in Choreo. Click `Push
                                    to Choreo` to create them.
                                </p>
                                <ActionContainer>
                                    {pushingComponent && <VSCodeProgressRing />}
                                    <VSCodeButton
                                        appearance="primary"
                                        disabled={pushingComponent}
                                        onClick={() => handlePushToChoreoClick()}
                                    >
                                        <Codicon name="cloud-upload" />
                                        &nbsp; Push to Choreo
                                    </VSCodeButton>
                                </ActionContainer>
                            </>
                        )}
                        {!hasPushableComponents && componentsOutOfSync && (
                            <>
                                <p>
                                    <InlineIcon>
                                        <Codicon name="lightbulb" />
                                    </InlineIcon>
                                    &nbsp; Some components are not committed and pushed to the
                                    upstream github repository.
                                    {hasLocalComponents &&
                                        ` Please commit and push them before pushing to Choreo.`}
                                </p>
                                <ActionContainer>
                                    {pushingComponent && <VSCodeProgressRing />}
                                    <VSCodeButton
                                        appearance="secondary"
                                        onClick={handleOpenSourceControlClick}
                                    >
                                        <Codicon name="source-control" />
                                        &nbsp; Open Source Control
                                    </VSCodeButton>
                                    <VSCodeButton
                                        appearance="secondary"
                                        onClick={() => handleRefreshComponentsClick()}
                                        disabled={loadingComponents}
                                    >
                                        <Codicon name="refresh" />
                                        &nbsp; Recheck
                                    </VSCodeButton>
                                </ActionContainer>
                            </>
                        )}
                    </>
                )}
            </WizardContainer>
        </>
    );
}
