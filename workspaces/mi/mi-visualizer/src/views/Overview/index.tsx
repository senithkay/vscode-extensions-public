/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import { ProjectStructureResponse, WorkspaceFolder } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import ProjectStructureView from "./ProjectStructureView";
import { View, ViewContent, ViewHeader } from "../../components/View";

interface OverviewProps {
    stateUpdated: boolean;
}

export function Overview(props: OverviewProps) {
    const { rpcClient } = useVisualizerContext();
    const [workspaces, setWorkspaces] = React.useState<WorkspaceFolder[]>([]);
    const [activeWorkspaces, setActiveWorkspaces] = React.useState<WorkspaceFolder>(undefined);
    const [selected, setSelected] = React.useState<string>("");
    const [projectStructure, setProjectStructure] = React.useState<ProjectStructureResponse>(undefined);

    useEffect(() => {
        rpcClient.getMiVisualizerRpcClient().getWorkspaces().then((response) => {
            setWorkspaces(response.workspaces);
            setActiveWorkspaces(response.workspaces[0]);
            changeWorkspace(response.workspaces[0].fsPath);
            console.log(response.workspaces[0]);
        });
    }, []);

    useEffect(() => {
        if (workspaces && selected) {
            rpcClient.getMiVisualizerRpcClient().getProjectStructure({ documentUri: selected }).then((response) => {
                console.log(response);
                setProjectStructure(response);
            });
        }
    }, [selected, props]);

    const changeWorkspace = (fsPath: string) => {
        setSelected(fsPath);
    }

    return (
        <View>
            <ViewHeader title={"Project: " + activeWorkspaces?.name} codicon="project">
            </ViewHeader>
            <ViewContent padding>
                {projectStructure && <ProjectStructureView projectStructure={projectStructure} workspaceDir={selected} />}
            </ViewContent>
        </View>
    );
}
