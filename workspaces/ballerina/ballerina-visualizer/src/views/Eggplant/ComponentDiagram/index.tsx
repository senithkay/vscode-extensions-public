/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import {
    DIRECTORY_MAP,
    EVENT_TYPE,
    MACHINE_VIEW,
    MachineStateValue,
    ProjectStructureArtifactResponse,
    ProjectStructureResponse,
} from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { Connection, Diagram, EntryPoint, NodePosition, Project } from "@wso2-enterprise/component-diagram";
import {
    View,
    ViewContent,
} from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { EggplantHeader } from "../EggplantHeader";
import { useVisualizerContext } from "../../../Context";

const CardContainer = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 10px;
`;

interface ComponentDiagramProps {
    stateUpdated: boolean;
}

export function ComponentDiagram(props: ComponentDiagramProps) {
    const { rpcClient } = useRpcContext();
    const { setPopupScreen } = useVisualizerContext();
    const [projectName, setProjectName] = React.useState<string>("");
    const [projectStructure, setProjectStructure] = React.useState<ProjectStructureResponse>();

    rpcClient?.onStateChanged((newState: MachineStateValue) => {
        if (typeof newState === 'object' && 'viewActive' in newState && newState.viewActive === 'viewReady') {
            fetchContext();
        }
    });

    const fetchContext = () => {
        rpcClient
            .getEggplantDiagramRpcClient()
            .getProjectStructure()
            .then((res) => {
                setProjectStructure(res);
            });
        rpcClient
            .getEggplantDiagramRpcClient()
            .getWorkspaces()
            .then((res) => {
                setProjectName(res.workspaces[0].name);
            });
    }

    useEffect(() => {
        fetchContext();
    }, []);

    const goToView = async (filePath: string, position: NodePosition) => {
        console.log(">>> component diagram: go to view", { filePath, position });
        rpcClient
            .getVisualizerRpcClient()
            .openView({ type: EVENT_TYPE.OPEN_VIEW, location: { documentUri: filePath, position: position } });
    };

    const handleAddArtifact = () => {
        rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.EggplantComponentView,
            },
        });
    };

    const handleGoToEntryPoints = (entryPoint: EntryPoint) => {
        if (entryPoint.location) {
            goToView(entryPoint.location.filePath, entryPoint.location.position);
        }
    }

    const handleAddConnection = () => {
        setPopupScreen("ADD_CONNECTION");
    };

    const handleGoToConnection = (connection: Connection) => {
        if (connection.location) {
            goToView(connection.location.filePath, connection.location.position);
        }
    }

    // TODO: improve loading ux
    if (!projectStructure) {
        return <>Loading...</>;
    }

    const project: Project = {
        "name": projectName,
        "entryPoints": [],
        "connections": [],
    }
    // generate project structure
    projectStructure.directoryMap[DIRECTORY_MAP.SERVICES].forEach((service) => {
        project.entryPoints.push({
            id: service.name,
            name: service.name,
            type: "service",
            location: {
                filePath: service.path,
                position: service.position,
            }
        });
    });
    // projectStructure.directoryMap[DIRECTORY_MAP.TASKS].forEach((task) => {
    //     project.entryPoints.push({
    //         id: task.name,
    //         name: task.name,
    //         type: "task",
    //         location: {
    //             filePath: task.path,
    //             position: task.position,
    //         }
    //     });
    // });
    // projectStructure.directoryMap[DIRECTORY_MAP.TRIGGERS].forEach((trigger) => {
    //     project.entryPoints.push({
    //         id: trigger.name,
    //         name: trigger.name,
    //         type: "trigger",
    //         location: {
    //             filePath: trigger.path,
    //             position: trigger.position,
    //         }
    //     });
    // });
    projectStructure.directoryMap[DIRECTORY_MAP.CONNECTIONS].forEach((connection) => {
        project.connections.push({
            id: connection.name,
            name: connection.name,
            location: {
                filePath: connection.path,
                position: connection.position,
            }
        });
    });

    console.log(">>> component diagram: project", project);

    return (
        <View>
            <ViewContent padding>
                <EggplantHeader />
                <Diagram
                    project={project}
                    onAddEntryPoint={handleAddArtifact}
                    onAddConnection={handleAddConnection}
                    onEntryPointSelect={handleGoToEntryPoints}
                    onConnectionSelect={handleGoToConnection}
                />
            </ViewContent>
        </View>
    );
}

export default ComponentDiagram;
