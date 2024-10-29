/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import { EVENT_TYPE, MACHINE_VIEW, ProjectOverviewResponse, ProjectStructureResponse, WorkspaceFolder } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import ProjectStructureView from "./ProjectStructureView";
import { View, ViewContent, ViewHeader } from "../../components/View";
import { Button, Codicon } from "@wso2-enterprise/ui-toolkit";
import ComponentDiagram from "./ComponentDiagram";

interface OverviewProps {
}

function Overview(props: OverviewProps) {
    const { rpcClient } = useVisualizerContext();
    const [workspaces, setWorkspaces] = React.useState<WorkspaceFolder[]>([]);
    const [activeWorkspaces, setActiveWorkspaces] = React.useState<WorkspaceFolder>(undefined);
    const [selected, setSelected] = React.useState<string>("");
    const [projectStructure, setProjectStructure] = React.useState<ProjectStructureResponse>(undefined);
    const [projectOverview, setProjectOverview] = React.useState<ProjectOverviewResponse>(undefined);

    useEffect(() => {
        rpcClient.getMiVisualizerRpcClient().getWorkspaces().then((response) => {
            setWorkspaces(response.workspaces);
            setActiveWorkspaces(response.workspaces[0]);
            changeWorkspace(response.workspaces[0].fsPath);
        });
    }, []);

    useEffect(() => {
        if (workspaces && selected) {
            rpcClient.getMiVisualizerRpcClient().getProjectStructure({ documentUri: selected }).then((response) => {
                setProjectStructure(response);
            });

            rpcClient.getMiVisualizerRpcClient().getProjectOverview({ documentUri: selected }).then((response) => {
                setProjectOverview(response);
            });
        }
    }, [selected, props]);

    const changeWorkspace = (fsPath: string) => {
        setSelected(fsPath);
    }

    const handleBuild = async () => {
        await rpcClient.getMiDiagramRpcClient().buildProject();
    }

    const handleExport = async () => {
        await rpcClient.getMiDiagramRpcClient().exportProject({
            projectPath: activeWorkspaces.fsPath,
        });
    }


    const handleAddArtifact = () => {
        rpcClient.getMiVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.ADD_ARTIFACT
            },
        })
    }

    return (
        <View>
            <ViewHeader
                title={"Project: " + activeWorkspaces?.name}
                icon="project"
                iconSx={{ fontSize: "15px" }}
            >
                <Button
                    appearance="primary"
                    onClick={handleAddArtifact}
                    tooltip="Add Artifact"
                >
                    <Codicon name="add" sx={{ marginRight: "4px" }} />
                    Add Artifact
                </Button>
                <Button
                    appearance="icon"
                    onClick={handleBuild}
                    tooltip="Build"
                >
                    <Codicon name="combine" sx={{ marginRight: "4px" }} />
                    Build
                </Button>
                <Button
                    appearance="icon"
                    onClick={handleExport}
                    tooltip="Export"
                >
                    <Codicon name="export" sx={{ marginRight: "4px" }} />
                    Export
                </Button>
            </ViewHeader>
            <ViewContent padding>
                <ComponentDiagram projectStructure={projectOverview} projectName={activeWorkspaces?.name} />
            </ViewContent>
            <ViewContent padding>
                {projectStructure && <ProjectStructureView projectStructure={projectStructure} workspaceDir={selected} />}
            </ViewContent>
        </View>
    );
}
export default React.memo(Overview);
