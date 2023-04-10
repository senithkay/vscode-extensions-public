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
    VSCodeTag
} from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import React, { useCallback, useMemo, useState } from "react";
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
    position: relative;
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

const InlineIcon = styled.span`
    vertical-align: sub;
    padding-left: 5px;
`;

const ProgressWrap = styled.div`
    padding: 15px;
    position: absolute;
    top: 15px;
    right: 15px;
`;

export interface ProjectOverviewProps {
    projectId?: string;
    orgName?: string;
}

export function ProjectOverview(props: ProjectOverviewProps) {
    const { orgName, projectId } = props;
    const queryClient = useQueryClient();
    const [currentOrgName, setCurrentOrgName] = useState(orgName);
    const validOrg = orgName === currentOrgName;

    const { data: isLoggedIn } = useQuery({
        queryKey: ["overview_project_login_status"],
        queryFn: () => ChoreoWebViewAPI.getInstance().getLoginStatus(),
        select: (status) => status === 'LoggedIn'
    });

    const { data: validProject } = useQuery({
        queryKey: ["overview_project_opened_project_id", projectId],
        queryFn: () => ChoreoWebViewAPI.getInstance().getChoreoProject(),
        select: (p) => p.id === projectId
    });

    const isActive = useMemo(() => {
        return validProject && validOrg && isLoggedIn;
    }, [validProject, validOrg, isLoggedIn]);

    const inactiveMessage = useMemo(() => {
        if (!isLoggedIn) {
            return "Please Login to Choreo in order to activate this window.";
        }
        if (!validOrg) {
            return `Please select ${orgName} as your organization in order to activate this window.`;
        }
        if (!validProject) {
            return "Please clone or open your project to activate this window.";
        }
    }, [validProject, validOrg, isLoggedIn]);

    ChoreoWebViewAPI.getInstance().onSelectedOrgChanged((newOrg=>{
        setCurrentOrgName(newOrg.handle);
    }))

    ChoreoWebViewAPI.getInstance().onLoginStatusChanged((newStatus)=>{
        queryClient.setQueryData(["overview_project_login_status"], newStatus);
    })

    const { data: project } = useQuery({
        queryKey: ["overview_project", projectId],
        queryFn: () => ChoreoWebViewAPI.getInstance().getAllProjects(),
        enabled: validOrg && isLoggedIn,
        select: (fetchedProjects) =>
            fetchedProjects.find((i) => i.id === projectId),
    });

    const { isLoading: isLoadingCompOnly, isRefetching: refetchingCompOnly, refetch: refetchComponentsOnly, isFetched } = useQuery({
        queryKey: ["overview_component_list_only", projectId],
        queryFn: async () => ChoreoWebViewAPI.getInstance().getComponents(projectId),
        refetchInterval: 120000, // check for new components every 2 minutes
        onSuccess: () => {
            refetchComponents()
        },
        refetchOnWindowFocus: false,
        enabled: validOrg && isLoggedIn,
    });

    const {
        data: components = [],
        isLoading: loadingComponents,
        isRefetching: refetchingComponents,
        refetch: refetchComponents,
    } = useQuery({
        queryKey: ["overview_component_list", projectId],
        queryFn: async () => ChoreoWebViewAPI.getInstance().getEnrichedComponents(projectId),
        onError: (error: Error) => ChoreoWebViewAPI.getInstance().showErrorMsg(error.message),
        refetchInterval: 15000, // Refetch component status every 15 seconds
        enabled: !refetchingCompOnly && isFetched && isLoggedIn && validOrg
    });

    const {} = useQuery({
        queryKey: ["deleted_component_list_only", projectId],
        queryFn: async () => ChoreoWebViewAPI.getInstance().getDeletedComponents(projectId),
        onSuccess: (data) => {
            queryClient.setQueryData(["deleted_component_list", projectId], data)
            if (data.length > 0 && isActive) {
                ChoreoWebViewAPI.getInstance().removeDeletedComponents({components: data, projectId});
            }
        },
    });

    const { data: location } = useQuery({
        queryKey: ["overview_project_location", projectId],
        queryFn: () => ChoreoWebViewAPI.getInstance().getProjectLocation(projectId),
        enabled: isLoggedIn && validOrg
    });

    const { mutate: handleDeleteComponentClick, isLoading: deletingComponent } = useMutation({
        mutationFn: (component: Component) => ChoreoWebViewAPI.getInstance().deleteComponent({ component, projectId }),
        onError: (error: Error) => ChoreoWebViewAPI.getInstance().showErrorMsg(error.message),
        onSuccess: (data) => {
            if (data) {
                const filteredComponents = components.filter(item => data.local ? item.name !== data.name : item.id !== data.id);
                queryClient.setQueryData(["overview_component_list", projectId], filteredComponents);
                refetchComponentsOnly();
            }
        },
    });

    const { mutate: handlePushComponentClick, isLoading: pushingSingleComponent } = useMutation({
        mutationFn: (componentName: string) => ChoreoWebViewAPI.getInstance().pushLocalComponentToChoreo({ projectId, componentName }),
        onError: (error: Error) => ChoreoWebViewAPI.getInstance().showErrorMsg(error.message),
        onSuccess: () => refetchComponentsOnly(),
    });

    const { mutate: handleRefreshComponentsClick, isLoading: reloadingRegistry } = useMutation({
        mutationFn: () => ChoreoWebViewAPI.getInstance().triggerCmd("wso2.choreo.projects.registry.refresh"),
        onSuccess: () => refetchComponentsOnly(),
    });

    const { mutate: handlePushToChoreoClick, isLoading: pushingComponent } =
        useMutation({
            mutationFn: () => ChoreoWebViewAPI.getInstance().pushLocalComponentsToChoreo(projectId),
            onError: (error: Error) => ChoreoWebViewAPI.getInstance().showErrorMsg(error.message),
            onSuccess: () => refetchComponentsOnly(),
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

    const fetchingComponents = reloadingRegistry || loadingComponents || refetchingComponents || isLoadingCompOnly || refetchingCompOnly;

    return (
        <>
            <WizardContainer>
                {(fetchingComponents && components?.length !== 0) && (
                    <ProgressWrap>
                        <VSCodeProgressRing />
                    </ProgressWrap>
                )}
                <HeaderContainer>
                    <h1>{project?.name}</h1>
                    <VSCodeButton
                        appearance="icon"
                        title="Open in Choreo Console"
                        onClick={onOpenConsoleClick}
                    >
                        <Codicon name="link-external" />
                    </VSCodeButton>
                    {!isActive && <VSCodeTag color='yellow' title={inactiveMessage}>Inactive</VSCodeTag>}
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
                    <VSCodeButton
                        appearance="icon"
                        onClick={() => refetchComponentsOnly()}
                        title="Refresh component list"
                        disabled={fetchingComponents || !isActive}
                    >
                        <Codicon name="refresh" />
                    </VSCodeButton>
                </ComponentsHeader>
                <ComponentList
                    components={components}
                    projectId={projectId}
                    orgName={orgName}
                    openSourceControl={handleOpenSourceControlClick}
                    onComponentDeleteClick={handleDeleteComponentClick}
                    handlePushComponentClick={handlePushComponentClick}
                    loading={pushingComponent || pushingSingleComponent || deletingComponent}
                    fetchingComponents={fetchingComponents}
                    isActive={isActive}
                />

                {(hasPushableComponents || pushingComponent) && (
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
                                disabled={pushingComponent || fetchingComponents || pushingSingleComponent || !isActive}
                                onClick={() => handlePushToChoreoClick()}
                            >
                                <Codicon name="cloud-upload" />
                                &nbsp; Push to Choreo
                            </VSCodeButton>
                        </ActionContainer>
                    </>
                )}
                {!(pushingComponent || hasPushableComponents) && componentsOutOfSync && (
                    <>
                        <p>
                            <InlineIcon>
                                <Codicon name="lightbulb" />
                            </InlineIcon>
                            &nbsp;
                            {hasLocalComponents
                                ? "Some components are not committed and pushed to the upstream github repository. Please commit and push them before pushing to Choreo."
                                : "Some components have changes which are not yet pushed to git repository. Please commit them to be visible on Choreo"}
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
                                disabled={fetchingComponents || !isActive}
                            >
                                <Codicon name="refresh" />
                                &nbsp; Recheck
                            </VSCodeButton>
                        </ActionContainer>
                    </>
                )}
            </WizardContainer>
        </>
    );
}
