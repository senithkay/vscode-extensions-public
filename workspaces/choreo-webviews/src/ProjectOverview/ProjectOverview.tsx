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

import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import { useState, useEffect } from "react";
import { Component, Project } from "@wso2-enterprise/choreo-core";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { ComponentList } from "./ComponentList";

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

export interface ProjectOverviewProps {
    projectId?: string;
    orgName?: string;
}


export function ProjectOverview(props: ProjectOverviewProps) {
    const [project, setProject] = useState<Project | undefined>(undefined);
    const [components, setComponents] = useState<Component[] | undefined>(undefined);
    const [location, setLocation] = useState<string | undefined>(undefined);
    const [projectRepo, setProjectRepo] = useState<string | undefined>(undefined);
    const projectId = props.projectId ? props.projectId : '';
    const orgName = props.orgName ? props.orgName : '';

    const rpcInstance = ChoreoWebViewAPI.getInstance();
    // Set the starting project with the project id passed by props
    useEffect(() => {
        rpcInstance.getAllProjects().then((fetchedProjects) => {
            setProject(fetchedProjects.find((i) => { return i.id === projectId; }));
        });
    }, []);

    // Set the components of the project
    useEffect(() => {
        rpcInstance.getComponents(projectId).then(setComponents);
    }, []);

    // Get project location & repo
    useEffect(() => {
        rpcInstance.getProjectLocation(projectId).then(setLocation);
        rpcInstance.getProjectRepository(projectId).then(setProjectRepo);
    }, []);

    // Listen to changes in project selection
    rpcInstance.onSelectedProjectChanged((newProjectId) => {
        setComponents(undefined);
        // setProject(undefined); will not remove project to fix the glitch
        rpcInstance.getAllProjects().then((fetchedProjects) => {
            setProject(fetchedProjects.find((i) => { return i.id === newProjectId; }));
        });
        rpcInstance.getComponents(newProjectId).then(setComponents);
        rpcInstance.getProjectLocation(newProjectId).then(setLocation);
    });

    const handleCloneProjectClick = (e: any) => {
        rpcInstance.cloneChoreoProject(project ? project.id : '');
    };

    const handleOpenProjectClick = (e: any) => {
        rpcInstance.openChoreoProject(project ? project.id : '');
    };

    return (
        <>
            <WizardContainer>
                <h1>{project?.name}&nbsp;</h1>
                {location === undefined ?
                    <>
                        <p>To open the project clone in to your local machine</p>
                        <ActionContainer>
                            <VSCodeButton appearance="primary" onClick={handleCloneProjectClick}>Clone Project</VSCodeButton>
                            <LinkButton>
                                <VSCodeLink href={`https://console.choreo.dev/organizations/${orgName}/projects/${project?.id}`}>
                                    Open in Choreo Console
                                </VSCodeLink>
                            </LinkButton>
                        </ActionContainer>
                    </>
                    :
                    <>
                        <p>Found a local copy of the project at `{location}`. </p>
                        <ActionContainer>
                            <VSCodeButton appearance="primary" onClick={handleOpenProjectClick}>Open Project</VSCodeButton>
                            <LinkButton>
                                <VSCodeLink href={`https://console.choreo.dev/organizations/${orgName}/projects/${project?.id}`}>
                                    Open in Choreo Console
                                </VSCodeLink>
                            </LinkButton>
                        </ActionContainer>
                    </>}
                {projectRepo !== undefined && <p>Project repository: {projectRepo}</p>}

                <h2>Components</h2>
                <ComponentList components={components} />
            </WizardContainer>
        </>
    );
}
