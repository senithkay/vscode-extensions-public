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

import { VSCodeButton, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Component, Project } from "@wso2-enterprise/choreo-core";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { ComponentList } from "./ComponentList";
import { Codicon } from "../Codicon/Codicon";

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
    const [project, setProject] = useState<Project | undefined>(undefined);
    const [components, setComponents] = useState<Component[]>([]);
    const [location, setLocation] = useState<string | undefined>(undefined);
    const [isActive, setActive] = useState<boolean>(false);
    const [creatingComponents, setCreatingComponents] = useState<boolean>(false);
    const [loadingComponents, setLoadingComponents] = useState(false);
    const projectId = props.projectId ? props.projectId : '';
    const orgName = props.orgName ? props.orgName : '';

    // Set the starting project with the project id passed by props
    useEffect(() => {
        ChoreoWebViewAPI.getInstance().getAllProjects().then((fetchedProjects) => {
            setProject(fetchedProjects.find((i) => { return i.id === projectId; }));
        });
    }, [projectId, orgName]);

    const fetchComponents = useCallback(async (projectId) => {
        setLoadingComponents(true);
        try {
            const components = await ChoreoWebViewAPI.getInstance().getComponents(projectId);
            setComponents(components);
        } finally {
            setLoadingComponents(false);
        }
    }, []);

    // Set the components of the project
    useEffect(() => {
        fetchComponents(projectId);
    }, [projectId, orgName]);

    useEffect(() => {
        ChoreoWebViewAPI.getInstance().getChoreoProject().then((p) => {
            if (p && p.id === projectId) {
                setActive(true);
            } else {
                setActive(false);
            }
        });
    }, [projectId, orgName]);

    // Get project location & repo
    useEffect(() => {
        ChoreoWebViewAPI.getInstance().getProjectLocation(projectId).then(setLocation);
    }, [projectId, orgName]);




    // Listen to changes in project selection
    ChoreoWebViewAPI.getInstance().onSelectedProjectChanged((newProjectId) => {
        if (projectId !== newProjectId) {
            setComponents(undefined);
        }
        // setProject(undefined); will not remove project to fix the glitch
        ChoreoWebViewAPI.getInstance().getAllProjects().then((fetchedProjects) => {
            setProject(fetchedProjects.find((i) => { return i.id === newProjectId; }));
        });
        fetchComponents(newProjectId);
        ChoreoWebViewAPI.getInstance().getProjectLocation(newProjectId).then(setLocation);
        ChoreoWebViewAPI.getInstance().getChoreoProject().then((p) => {
            if (p && p.id === newProjectId) {
                setActive(true);
            } else {
                setActive(false);
            }
        });
    });

    const handleCloneProjectClick = useCallback(() => {
        ChoreoWebViewAPI.getInstance().cloneChoreoProject(project ? project.id : '');
    }, [project]);

    const handleOpenProjectClick = useCallback(() => {
        ChoreoWebViewAPI.getInstance().openChoreoProject(project ? project.id : '');
    }, [project]);

    const handlePushToChoreoClick = useCallback(async () => {
        setCreatingComponents(true);
        try {
            await ChoreoWebViewAPI.getInstance().pushLocalComponentsToChoreo(projectId)
        } catch (error) {
            ChoreoWebViewAPI.getInstance().showErrorMsg((error as Error)?.message);
        } finally {
            setCreatingComponents(false);
            fetchComponents(projectId);
        }
    }, [projectId]);

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
        ChoreoWebViewAPI.getInstance().triggerCmd('wso2.choreo.component.create');
    }, []);

    const handleOpenSourceControlClick = useCallback(() => {
        ChoreoWebViewAPI.getInstance().triggerCmd('workbench.scm.focus');
    }, []);

    const handleRefreshComponentsClick = useCallback(async () => {
        try{
            setLoadingComponents(true);
            await ChoreoWebViewAPI.getInstance().triggerCmd('wso2.choreo.projects.registry.refresh');
        } finally {
            setLoadingComponents(false);
        }
        fetchComponents(projectId);
    }, [project]);

    const handleDeleteComponentClick = useCallback(async (component: Component) => {
        await ChoreoWebViewAPI.getInstance().deleteComponent({ component, projectId })
        fetchComponents(projectId);
    }, [projectId, project]);

    const handlePushComponentClick = useCallback(async (componentName) => {
        await ChoreoWebViewAPI.getInstance().pushLocalComponentToChoreo({ projectId, componentName })
        fetchComponents(projectId);
    }, [projectId]);

    const hasLocalComponents = useMemo(() => components?.some(component => component.local), [components])

    /** Has components with local changes or unpushed commits */
    const componentsOutOfSync = useMemo(() => {
        return components?.some(component => component.hasDirtyLocalRepo || component.hasUnPushedLocalCommits);
    }, [components])

    /** Every local components is without any local git changes to commit/push. These components can be pushed to Choreo */
    const hasPushableComponents = useMemo(() => {
        const localOnlyComponents = components.filter(component => component.local);
        if (localOnlyComponents.length === 0) {
            return false;
        }
        return localOnlyComponents?.every(component => !component.hasDirtyLocalRepo && !component.hasUnPushedLocalCommits);
    }, [components])


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
                    loading={loadingComponents || creatingComponents}
                />

                {loadingComponents ? (
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
                                    {creatingComponents && <VSCodeProgressRing />}
                                    <VSCodeButton
                                        appearance="primary"
                                        disabled={creatingComponents}
                                        onClick={handlePushToChoreoClick}
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
                                    {creatingComponents && <VSCodeProgressRing />}
                                    <VSCodeButton
                                        appearance="secondary"
                                        onClick={handleOpenSourceControlClick}
                                    >
                                        <Codicon name="source-control" />
                                        &nbsp; Open Source Control
                                    </VSCodeButton>
                                    <VSCodeButton
                                        appearance="secondary"
                                        onClick={handleRefreshComponentsClick}
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
