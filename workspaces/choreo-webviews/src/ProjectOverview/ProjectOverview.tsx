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
/* eslint-disable react-hooks/exhaustive-deps */
import { VSCodeButton, VSCodeLink, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import { useState, useEffect } from "react";
import { Component, Organization, Project } from "@wso2-enterprise/choreo-core";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { ComponentList } from "./ComponentList";
import { Codicon } from "../Codicon/Codicon";

const WizardContainer = styled.div`
    width: 100%;
    display  : flex;
    flex-direction: column;
`;

const ActionContainer = styled.div`
    display  : flex;
    flex-direction: row;
    gap: 10px;
`;

const LinkButton = styled.div`
    padding-top  : 5px;
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


function hasLocal(components: Component[]) {
    return components.some((component) => {
        return component.local;
    });
}


export function ProjectOverview(props: ProjectOverviewProps) {
    const [project, setProject] = useState<Project | undefined>(undefined);
    const [components, setComponents] = useState<Component[] | undefined>(undefined);
    const [location, setLocation] = useState<string | undefined>(undefined);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [projectRepo, setProjectRepo] = useState<string | undefined>(undefined);
    const [isActive, setActive] = useState<boolean>(false);
    const [creatingComponents, setCreatingComponents] = useState<boolean>(false);
    const projectId = props.projectId ? props.projectId : '';
    const orgName = props.orgName ? props.orgName : '';

    const rpcInstance = ChoreoWebViewAPI.getInstance();
    // Set the starting project with the project id passed by props
    useEffect(() => {
        async function fetchProjects() {
            const org: Organization = await rpcInstance.getCurrentOrg();
            rpcInstance.getProjectClient().getProjects({
                orgId: org.id
            }).then((fetchedProjects) => {
                setProject(fetchedProjects.find((i) => { return i.id === projectId; }));
            });
        }
        fetchProjects();
    }, []);

    // Set the components of the project
    useEffect(() => {
        rpcInstance.getComponents(projectId).then(setComponents);
    }, []);

    useEffect(() => {
        rpcInstance.getChoreoProject().then((p) => {
            if (p && p.id === projectId) {
                setActive(true);
            } else {
                setActive(false);
            }
        });
    }, []);

    // Get project location & repo
    useEffect(() => {
        rpcInstance.getProjectLocation(projectId).then(setLocation);
        rpcInstance.getProjectRepository(projectId).then(setProjectRepo);
    }, []);

    // Listen to changes in project selection
    rpcInstance.onSelectedProjectChanged(async (newProjectId) => {
        setComponents(undefined);
        // setProject(undefined); will not remove project to fix the glitch
        const org: Organization = await rpcInstance.getCurrentOrg();
        rpcInstance.getProjectClient().getProjects({
            orgId: org.id
        }).then((fetchedProjects) => {
            setProject(fetchedProjects.find((i) => { return i.id === newProjectId; }));
        });
        rpcInstance.getComponents(newProjectId).then(setComponents);
        rpcInstance.getProjectLocation(newProjectId).then(setLocation);
        rpcInstance.getChoreoProject().then((p) => {
            if (p && p.id === newProjectId) {
                setActive(true);
            } else {
                setActive(false);
            }
        });
    });

    const handleCloneProjectClick = (e: any) => {
        rpcInstance.cloneChoreoProject(project ? project.id : '');
    };

    const handleOpenProjectClick = (e: any) => {
        rpcInstance.openChoreoProject(project ? project.id : '');
    };

    const handlePushToChoreoClick = (e: any) => {
        setCreatingComponents(true);
        rpcInstance.pushLocalComponentsToChoreo(project ? project.id : '').then(() => {
            setCreatingComponents(false);
            rpcInstance.getComponents(project ? project.id : '').then(setComponents);
        });
    };

    const handleOpenArchitectureViewClick = (e: any) => {
        rpcInstance.openArchitectureView();
    };

    return (
        <>
            <WizardContainer>
                <h1>{project?.name}&nbsp;{isActive && <ActiveLabel>(Currently Opened)</ActiveLabel>}</h1>
                {location === undefined &&
                    <>
                        <p><InlineIcon><Codicon name="info" /></InlineIcon> To open the project clone in to your local machine</p>
                        <ActionContainer>
                            <VSCodeButton appearance="primary" onClick={handleCloneProjectClick}><Codicon name="cloud-download" />&nbsp;Clone Project</VSCodeButton>
                            <VSCodeButton appearance="secondary" disabled={true}>Open Project</VSCodeButton>
                            <VSCodeButton appearance="secondary" disabled={true}>Architecture View</VSCodeButton>
                            <LinkButton>
                                <VSCodeLink href={`https://console.choreo.dev/organizations/${orgName}/projects/${project?.id}`}>
                                    Open in Choreo Console
                                </VSCodeLink>
                            </LinkButton>
                        </ActionContainer>
                    </>
                }
                {location !== undefined && !isActive &&
                    <>
                        <p><InlineIcon><Codicon name="info" /></InlineIcon> Found a local copy of the project at `{location}`. </p>
                        <ActionContainer>
                            <VSCodeButton appearance="secondary" disabled={true}><Codicon name="cloud-download" />&nbsp;Clone Project</VSCodeButton>
                            <VSCodeButton appearance="primary" onClick={handleOpenProjectClick}>Open Project</VSCodeButton>
                            <VSCodeButton appearance="secondary" disabled={true}>Architecture View</VSCodeButton>
                            <LinkButton>
                                <VSCodeLink href={`https://console.choreo.dev/organizations/${orgName}/projects/${project?.id}`}>
                                    Open in Choreo Console
                                </VSCodeLink>
                            </LinkButton>
                        </ActionContainer>
                    </>
                }
                {isActive &&
                    <>
                        <p><InlineIcon><Codicon name="info" /></InlineIcon> Open the architecture view to add components. </p>
                        <ActionContainer>
                            <VSCodeButton appearance="secondary" disabled={true}><Codicon name="cloud-download" />&nbsp;Clone Project</VSCodeButton>
                            <VSCodeButton appearance="secondary" disabled={true}>Open Project</VSCodeButton>
                            <VSCodeButton appearance="primary" onClick={handleOpenArchitectureViewClick}>Architecture View</VSCodeButton>
                            <LinkButton>
                                <VSCodeLink href={`https://console.choreo.dev/organizations/${orgName}/projects/${project?.id}`}>
                                    Open in Choreo Console
                                </VSCodeLink>
                            </LinkButton>
                        </ActionContainer>
                    </>
                }


                <h2>Components</h2>
                <ComponentList components={components} />
                {components !== undefined && hasLocal(components) &&
                    <>
                        <p>
                            <InlineIcon><Codicon name="lightbulb" /></InlineIcon>
                            Some components are not created in Choreo. Please commit your changes to github repo and click `Push to Choreo`
                        </p>
                        <ActionContainer>
                            {creatingComponents && <VSCodeProgressRing />}
                            <VSCodeButton
                                appearance="secondary"
                                disabled={creatingComponents}
                                onClick={handlePushToChoreoClick}>
                                <Codicon name="cloud-upload" />&nbsp;
                                Push to Choreo
                            </VSCodeButton>
                        </ActionContainer>
                    </>
                }
            </WizardContainer>
        </>
    );
}
