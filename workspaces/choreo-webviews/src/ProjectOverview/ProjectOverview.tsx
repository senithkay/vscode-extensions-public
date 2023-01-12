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

import { VSCodeDataGrid, VSCodeDataGridRow, VSCodeDataGridCell, VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import { useContext, useState, useEffect } from "react";
import { SignIn } from "../SignIn/SignIn";
import { ChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { Component, Project } from "@wso2-enterprise/choreo-core";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";

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

export interface ProjectOverviewProps {
    projectId?: string;
}

export function ProjectOverview(props: ProjectOverviewProps) {
    const [project, setProject] = useState<Project | undefined>(undefined);
    const [components, setComponents] = useState<Component[] | undefined>(undefined);
    const projectId = props.projectId ? props.projectId : '';

    const rpcInstance = ChoreoWebViewAPI.getInstance();
    // Set the starting project with the project id passed by props
    useEffect(() => {
        rpcInstance.getAllProjects().then((fetchedProjects) => {
            setProject(fetchedProjects.find((i) => { return i.id === projectId; }));
        });
    }, []);

    // Set the components of the project
    useEffect(() => {
        rpcInstance.getComponents(projectId).then((components: Component[]) => {
            setComponents(components);
        });
    }, []);

    // Listen to changes in project selection
    useEffect(() => {
        rpcInstance.onSelectedProjectChanged((newProjectId) => {
            rpcInstance.getAllProjects().then((fetchedProjects) => {
                setProject(fetchedProjects.find((i) => { return i.id === newProjectId; }));
            })
            rpcInstance.getComponents(newProjectId).then((components: Component[]) => {
                setComponents(components);
            });
        });
    }, []);


    return (
        <>
            <WizardContainer>
                <h1>{project?.name}</h1>
                <p>Unable to find a local copy of the project. You can clone the project to your local machine and edit.</p>
                <ActionContainer>
                    <VSCodeButton appearance="secondary">Open Local Copy</VSCodeButton>
                    <VSCodeButton appearance="secondary">Open in Choreo Console</VSCodeButton>
                    <VSCodeButton appearance="primary">Clone Project</VSCodeButton>
                </ActionContainer>
                <h2>Components</h2>
                <VSCodeDataGrid aria-label="Components">
                    <VSCodeDataGridRow rowType="header">
                        <VSCodeDataGridCell cellType={"columnheader"} gridColumn="1">Name</VSCodeDataGridCell>
                        <VSCodeDataGridCell cellType={"columnheader"} gridColumn="2">Version</VSCodeDataGridCell>
                    </VSCodeDataGridRow>
                    {
                        components?.map((component) => {
                            return <VSCodeDataGridRow>
                                <VSCodeDataGridCell gridColumn="1">{component.name}</VSCodeDataGridCell>
                                <VSCodeDataGridCell gridColumn="2">{component.version}</VSCodeDataGridCell>
                            </VSCodeDataGridRow>
                        })
                    }
                </VSCodeDataGrid>
            </WizardContainer>
        </>
    );
}
