/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { DIRECTORY_MAP, EVENT_TYPE, MACHINE_VIEW, ProjectStructureResponse } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { Connection, Diagram, EntryPoint, NodePosition, Project } from "@wso2-enterprise/component-diagram";
import { ProgressRing } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { Colors } from "../../../resources/constants";

const SpinnerContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
`;

const DiagramContainer = styled.div`
    height: 400px;
`;

interface ComponentDiagramProps {
    projectName: string;
    projectStructure: ProjectStructureResponse;
}

export function ComponentDiagram(props: ComponentDiagramProps) {
    const { projectName, projectStructure } = props;

    const { rpcClient } = useRpcContext();

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
                view: MACHINE_VIEW.BIComponentView,
            },
        });
    };

    const handleGoToEntryPoints = (entryPoint: EntryPoint) => {
        if (entryPoint.location) {
            goToView(entryPoint.location.filePath, entryPoint.location.position);
        }
    };

    const handleAddConnection = () => {
        handleAddArtifact();
    };

    const handleGoToConnection = async (connection: Connection) => {
        await rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.EditConnectionWizard,
                identifier: connection.name,
            },
        });
    };

    if (!projectStructure) {
        return (
            <SpinnerContainer>
                <ProgressRing color={Colors.PRIMARY} />
            </SpinnerContainer>
        );
    }

    const project: Project = {
        name: projectName,
        entryPoints: [],
        connections: [],
    };
    // generate project structure
    projectStructure.directoryMap[DIRECTORY_MAP.CONNECTIONS].forEach((connection) => {
        const name = connection.name.trim();
        project.connections.push({
            id: name,
            name: name,
            location: {
                filePath: connection.path,
                position: connection.position,
            },
        });
    });
    projectStructure.directoryMap[DIRECTORY_MAP.SERVICES].forEach((service) => {
        project.entryPoints.push({
            id: service.name,
            name: service.name,
            type: "service",
            location: {
                filePath: service.path,
                position: service.position,
            },
            connections: service.st?.VisibleEndpoints?.map((endpoint) => endpoint.name) || [],
        });
    });
    projectStructure.directoryMap[DIRECTORY_MAP.AUTOMATION].forEach((task) => {
        const isScheduleTask =
            (task.st as any)?.metadata?.annotations?.at(0)?.annotValue?.fields?.at(2)?.valueExpr?.literalToken
                ?.value === '"SCHEDULED"';
        let taskName = (task.st as any)?.metadata?.annotations?.at(0)?.annotValue?.fields?.at(0)?.valueExpr
            ?.literalToken?.value;
        if (taskName) {
            taskName = taskName.replace(/['"]/g, "");
        }

        project.entryPoints.push({
            id: task.name,
            name: taskName || task.name,
            type: isScheduleTask ? "schedule-task" : "task",
            location: {
                filePath: task.path,
                position: task.position,
            },
            connections:
                (task.st as any)?.functionBody?.VisibleEndpoints?.map((endpoint: { name: string }) => endpoint.name) ||
                [],
        });
    });

    return (
        <DiagramContainer>
            <Diagram
                project={project}
                onAddEntryPoint={handleAddArtifact}
                onAddConnection={handleAddConnection}
                onEntryPointSelect={handleGoToEntryPoints}
                onConnectionSelect={handleGoToConnection}
            />
        </DiagramContainer>
    );
}

export default ComponentDiagram;
