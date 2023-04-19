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

const SmallProgressRing = styled(VSCodeProgressRing)`
    height: calc(var(--design-unit) * 4px);
    width: calc(var(--design-unit) * 4px);
`;

export interface ProjectOverviewProps {
    projectId?: string;
    orgName?: string;
    componentLimit?: number;
    choreoUrl?: string;
    billingUrl?: string;
}

export function ProjectOverview(props: ProjectOverviewProps) {
    const { orgName, projectId, billingUrl, choreoUrl, componentLimit } = props;
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
        queryFn: async () => {
            const projectRes = await ChoreoWebViewAPI.getInstance().getChoreoProject();
            return projectRes || null;
        },
        select: (p) => p?.id === projectId
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

    ChoreoWebViewAPI.getInstance().onSelectedOrgChanged((newOrg => {
        setCurrentOrgName(newOrg.handle);
    }))

    const { data: org } = useQuery({
        queryKey: ["overview_project_org", orgName],
        queryFn: () => ChoreoWebViewAPI.getInstance().getCurrentOrg(),
    });

    ChoreoWebViewAPI.getInstance().onLoginStatusChanged((newStatus) => {
        queryClient.setQueryData(["overview_project_login_status"], newStatus);
    })

    const { data: project } = useQuery({
        queryKey: ["overview_project", projectId],
        queryFn: () => ChoreoWebViewAPI.getInstance().getAllProjects(),
        enabled: validOrg && isLoggedIn,
        select: (fetchedProjects) =>
            fetchedProjects.find((i) => i.id === projectId),
    });

    const {
        isLoading: isLoadingCompOnly,
        isRefetching: refetchingCompOnly,
        refetch: refetchComponentsOnly,
        isFetched,
        isError: isComponentsListError
    } = useQuery({
        queryKey: ["overview_component_list_only", projectId],
        queryFn: () => {
            refetchUsage();
            return ChoreoWebViewAPI.getInstance().getComponents(projectId)
        },
        refetchInterval: 120000, // check for new components every 2 minutes
        onSuccess: () => {
            refetchComponents();
        },
        onError: (error: Error) => ChoreoWebViewAPI.getInstance().showErrorMsg(error.message),
        refetchOnWindowFocus: false,
        enabled: validOrg && isLoggedIn,
    });

    const {
        data: components = [],
        isLoading: loadingComponents,
        isRefetching: refetchingComponents,
        refetch: refetchComponents,
        isError: isComponentStatusError
    } = useQuery({
        queryKey: ["overview_component_list", projectId],
        queryFn: () => ChoreoWebViewAPI.getInstance().getEnrichedComponents(projectId),
        onError: (error: Error) => ChoreoWebViewAPI.getInstance().showErrorMsg(error.message),
        refetchInterval: 15000, // Refetch component status every 15 seconds
        enabled: !refetchingCompOnly && isFetched && isLoggedIn && validOrg
    });

    useQuery({
        queryKey: ["deleted_component_show_prompt", projectId, isActive],
        queryFn: async () => ChoreoWebViewAPI.getInstance().getDeletedComponents(projectId),
        onSuccess: (data) => {
            if (data.length > 0) {
                ChoreoWebViewAPI.getInstance().removeDeletedComponents({ components: data, projectId });
            }
        },
        refetchOnWindowFocus: false,
        enabled: isActive
    });

    useQuery({
        queryKey: ["deleted_project_show_warning", projectId, isActive],
        queryFn: async () => ChoreoWebViewAPI.getInstance().checkProjectDeleted(projectId),
        refetchOnWindowFocus: false,
        refetchInterval: 15000, // Refetch component status every 15 seconds,
        enabled: isActive
    });

    const { data: location } = useQuery({
        queryKey: ["overview_project_location", projectId],
        queryFn: async () => {
            const location = await ChoreoWebViewAPI.getInstance().getProjectLocation(projectId);
            return location || null;
        },
        enabled: isLoggedIn && validOrg
    });

    const { data: usageData, refetch: refetchUsage } = useQuery({
        queryKey: ["overview_project_comp_count", projectId, orgName, components],
        queryFn: () => ChoreoWebViewAPI.getInstance().getComponentCount(),
    });

    const { mutate: handleDeleteComponentClick, isLoading: deletingComponent } = useMutation({
        mutationFn: (component: Component) => ChoreoWebViewAPI.getInstance().deleteComponent({ component, projectId }),
        onError: (error: Error) => ChoreoWebViewAPI.getInstance().showErrorMsg(error.message),
        onSuccess: async (data) => {
            if (data) {
                await queryClient.cancelQueries({ queryKey: ["overview_component_list", projectId] })
                const previousComponents: Component[] = queryClient.getQueryData(["overview_component_list", projectId])
                const filteredComponents = previousComponents?.filter(item => data.local ? item.name !== data.name : item.id !== data.id);
                queryClient.setQueryData(["overview_component_list", projectId], filteredComponents)
                refetchComponentsOnly();
            }
        },
    });

    const { mutate: handlePushComponentClick, isLoading: pushingSingleComponent } = useMutation({
        mutationFn: (componentName: string) => ChoreoWebViewAPI.getInstance().pushLocalComponentToChoreo({ projectId, componentName }),
        onError: (error: Error) => ChoreoWebViewAPI.getInstance().showErrorMsg(error.message),
        onSuccess: async (_, name) => {
            await queryClient.cancelQueries({ queryKey: ["overview_component_list", projectId] })
            const previousComponents: Component[] = queryClient.getQueryData(["overview_component_list", projectId])
            const updatedComponents = previousComponents?.map(item => item.name === name ? ({ ...item, local: false }) : item);
            queryClient.setQueryData(["overview_component_list", projectId], updatedComponents)
            refetchComponentsOnly()
        },
    });

    const { mutate: handleRefreshComponentsClick, isLoading: reloadingRegistry } = useMutation({
        mutationFn: () => ChoreoWebViewAPI.getInstance().triggerCmd("wso2.choreo.projects.registry.refresh"),
        onSuccess: () => refetchComponentsOnly(),
    });

    const { mutate: handlePushToChoreoClick, isLoading: pushingComponent } =
        useMutation({
            mutationFn: () => ChoreoWebViewAPI.getInstance().pushLocalComponentsToChoreo(projectId),
            onError: (error: Error) => ChoreoWebViewAPI.getInstance().showErrorMsg(error.message),
            onSuccess: async () => {
                await queryClient.cancelQueries({ queryKey: ["overview_component_list", projectId] })
                const previousComponents: Component[] = queryClient.getQueryData(["overview_component_list", projectId])
                const updatedComponents = previousComponents?.map(item => ({ ...item, local: false }));
                queryClient.setQueryData(["overview_component_list", projectId], updatedComponents)
                refetchComponentsOnly()
            },
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

    const consoleLink = `${choreoUrl}/organizations/${orgName}/projects/${project?.id}`;

    // todo: make fidp dynamic, if more than one idp is supported
    const billingLink = `${billingUrl}/cloud/choreo/upgrade?orgId=${org?.id}&fidp=google`;

    const onOpenConsoleClick = useCallback(() => {
        ChoreoWebViewAPI.getInstance().openExternal(consoleLink);
    }, [consoleLink]);

    const onOpenBillingClick = useCallback(() => {
        ChoreoWebViewAPI.getInstance().openExternal(billingLink);
    }, [billingLink]);

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

    /** Count of every local components that's without any local git changes to commit/push & valid path in remote repo. These components can be pushed to Choreo */
    const pushableComponentCount = useMemo(() => {
        const localOnlyComponents = components.filter(
            (component) => component.local
        );
        return localOnlyComponents.reduce((count, component) => {
            if (!component.hasDirtyLocalRepo && !component.hasUnPushedLocalCommits && component.isInRemoteRepo) {
                return count + 1;
            }
            return count;
        }, 0);
    }, [components])

    const hasPushableComponents = useMemo(() => pushableComponentCount > 0, [pushableComponentCount]);

    const pushableLimitExceeded = useMemo(() => {
        if (usageData && pushableComponentCount > 0) {
            return pushableComponentCount > (componentLimit - (usageData?.componentCount || 0));
        }
        return false;
    }, [pushableComponentCount, usageData, componentLimit]);

    const fetchingComponents = reloadingRegistry || loadingComponents || refetchingComponents || isLoadingCompOnly || refetchingCompOnly;

    const componentsPlaceholderLabel = useMemo(() => {
        if (components.length === 0){
            if (isComponentsListError) {
                return "Failed to fetch component list"
            } else if (isComponentStatusError) {
                return "Failed to fetch the status of components."
            } else if (!validProject){
                return "No components found. Clone & Open the project to create components."
            } else {
                return "No components found."
            }
        }
    }, [isComponentStatusError, isComponentsListError, components, validProject])

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
                    <VSCodeTag title={inactiveMessage}>{isActive ? "Active" : "Inactive"}</VSCodeTag>
                </HeaderContainer>
                {location === null && (
                    <>
                        <p>
                            <InlineIcon>
                                <Codicon name="info" />
                            </InlineIcon>{" "}
                            To develop the project, clone it to your local machine.
                        </p>
                        <ActionContainer>
                            <VSCodeButton
                                appearance="primary"
                                onClick={handleCloneProjectClick}
                            >
                                <Codicon name="cloud-download" />
                                &nbsp;Clone Project
                            </VSCodeButton>
                        </ActionContainer>
                        {components?.length > 0 && (
                            <>
                                <p>
                                    <InlineIcon>
                                        <Codicon name="info" />
                                    </InlineIcon>{" "}
                                    Open the architecture view to visualise your project components.{" "}
                                </p>
                                <ActionContainer>
                                    <VSCodeButton
                                        appearance="primary"
                                        onClick={handleOpenChoreoArchitectureViewClick}
                                    >
                                        Architecture View
                                    </VSCodeButton>
                                </ActionContainer>
                            </>
                        )}
                    </>
                )}
                {location !== null && !validProject && (
                    <>
                        <p>
                            <InlineIcon>
                                <Codicon name="info" />
                            </InlineIcon>{" "}
                            Found a local copy of the project at `{location}`.{" "}
                        </p>
                        <ActionContainer>
                            <VSCodeButton
                                appearance="primary"
                                onClick={handleOpenProjectClick}
                            >
                                Open Project
                            </VSCodeButton>
                        </ActionContainer>
                        <p>
                            <InlineIcon>
                                <Codicon name="info" />
                            </InlineIcon>{" "}
                            Open the architecture view to visualise your project components.{" "}
                        </p>
                        <ActionContainer>
                            <VSCodeButton
                                appearance="primary"
                                onClick={handleOpenChoreoArchitectureViewClick}
                            >
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
                    {fetchingComponents && components?.length !== 0 && (
                        <SmallProgressRing />
                    )}
                    {!fetchingComponents && (
                        <VSCodeButton
                            appearance="icon"
                            onClick={() => refetchComponentsOnly()}
                            title="Refresh component list"
                            disabled={!isActive || fetchingComponents}
                        >
                            <Codicon name="refresh" />
                        </VSCodeButton>
                    )}
                </ComponentsHeader>

                {components.length === 0 && fetchingComponents && (
                    <VSCodeProgressRing />
                )}

                {componentsPlaceholderLabel && !fetchingComponents && (
                    <p>
                        <InlineIcon>
                            <Codicon name="info" />
                        </InlineIcon>{" "}
                        {componentsPlaceholderLabel}
                    </p>
                )}

                {components.length > 0 && (
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
                        choreoUrl={choreoUrl}
                        reachedChoreoLimit={pushableComponentCount > (componentLimit - (usageData?.componentCount || 0))}
                        refreshComponentStatus={refetchComponents}
                    />
                )}

                {componentsOutOfSync && (
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

                {!componentsOutOfSync && (hasPushableComponents || pushingComponent) && (
                    <>
                        {pushableLimitExceeded && !pushingComponent && !pushingSingleComponent ? (
                            <>
                                <p>
                                    <InlineIcon>
                                        <Codicon name="lightbulb" />
                                    </InlineIcon>
                                    &nbsp; You have {pushableComponentCount} new components to
                                    be pushed to Choreo but have{" "}
                                    {componentLimit - (usageData?.componentCount || 0)} pushable
                                    components within your quota. Please upgrade your tier in order to proceed.
                                </p>
                                <ActionContainer>
                                    <VSCodeButton
                                        appearance="primary"
                                        onClick={() => onOpenBillingClick()}
                                    >
                                        Upgrade
                                    </VSCodeButton>
                                </ActionContainer>
                            </>
                        ) : <>
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
                        </>}
                    </>
                )}
            </WizardContainer>
        </>
    );
}
