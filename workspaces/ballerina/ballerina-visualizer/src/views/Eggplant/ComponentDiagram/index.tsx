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
    ProjectStructureResponse,
    OverviewFlow
} from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { Connection, Diagram, EntryPoint, NodePosition, Project } from "@wso2-enterprise/component-diagram";
import {
    Button,
    TextArea,
    Typography,
    View,
    ViewContent,
    LinkButton,
    Codicon,
    ProgressRing
} from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { EggplantHeader } from "../EggplantHeader";
import { useVisualizerContext } from "../../../Context";
import { BodyText, BodyTinyInfo } from "../../styles";
import { Colors } from "../../../resources/constants";

const CardTitleContainer = styled.div`
    display: flex;
    justify-content: space-between;
`;

const Content = styled.div`
    height: 100%;
`;

const ContentFooter = styled.div`
    height: 200px;
`;

const Title = styled(Typography)`
    margin: 8px 0;
`;

interface ComponentDiagramProps {
    stateUpdated: boolean;
}

export function ComponentDiagram(props: ComponentDiagramProps) {
    const { rpcClient } = useRpcContext();
    const [projectName, setProjectName] = React.useState<string>("");
    const [readmeContent, setReadmeContent] = React.useState<string>("");
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [overviewFlow, setOverviewFlow] = React.useState<OverviewFlow>(null);
    const [projectStructure, setProjectStructure] = React.useState<ProjectStructureResponse>();

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

        rpcClient
            .getEggplantDiagramRpcClient()
            .handleReadmeContent({ read: true })
            .then((res) => {
                setReadmeContent(res.content);
            });

        setOverviewFlow(null);
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
        rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.AddConnectionWizard,
            },
            isPopup: true
        });
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

    const handleSaveOverview = (value: string) => {
        rpcClient.getEggplantDiagramRpcClient().handleReadmeContent({ content: value, read: false });
        setReadmeContent(value);
    }

    const handleOverviewGenerate = async () => {
        setIsLoading(true);
        const suggestion = await rpcClient.getEggplantDiagramRpcClient().getAiSuggestions({ filePath: null, position: null, isOverview: true });
        setOverviewFlow(suggestion.overviewFlow);
        setIsLoading(false);
    }

    const handleDiagramOnAccept = async () => {
        setIsLoading(true);
        const res = await rpcClient.getEggplantDiagramRpcClient().createComponents({ overviewFlow });
        setIsLoading(false);
        if (res.response) {
            fetchContext();
        }
    }

    const handleDiagramOnReject = () => {
        setOverviewFlow(null);
    }

    const generateButton = () => {
        let component = <LinkButton onClick={handleOverviewGenerate} sx={{ fontSize: 14, padding: 8, color: Colors.PRIMARY, gap: 4 }}>
            <Codicon name={"wand"} iconSx={{ fontSize: 16 }} sx={{ height: 16 }} />
            Generate components using overview
        </LinkButton>;

        if (overviewFlow) {
            component =
                <span>
                    <LinkButton onClick={handleDiagramOnAccept} sx={{ fontSize: 14, padding: 8, color: Colors.PRIMARY, gap: 4 }}>
                        Apply
                    </LinkButton>
                    <LinkButton onClick={handleDiagramOnReject} sx={{ fontSize: 14, padding: 8, color: Colors.PRIMARY, gap: 4 }}>
                        Reject
                    </LinkButton>
                </span>;
            if (isLoading) {
                component =
                    <LinkButton onClick={() => { }} sx={{ fontSize: 14, padding: 8, color: Colors.PRIMARY, gap: 4 }}>
                        <ProgressRing sx={{ height: '16px', width: '16px' }} />
                        Applying changes to the project...
                    </LinkButton>
            }
        }

        return component;
    }

    console.log(">>> component diagram: project", project);

    // TODO: Refactor this component with meaningful components
    return (
        <View>
            <ViewContent padding>
                <EggplantHeader />
                <Content>
                    <Title variant="h2">Project Overview</Title>
                    <BodyText>
                        Provide a detailed description of your integration project, including its purpose, scope, and any key connections or systems involved.
                    </BodyText>
                    <TextArea
                        placeholder="E.g. A webhook to trigger an email notification. Accept JSON payloads with event details and send an email based on the event type. Include error handling for invalid data."
                        rows={6}
                        style={{ width: "100%" }}
                        value={readmeContent}
                        onKeyUp={(e) => handleSaveOverview(e.currentTarget.value)}
                    />
                    <BodyTinyInfo>This information will be used to generate an optimized and tailored integration solution.</BodyTinyInfo>
                    <CardTitleContainer>
                        <Title variant="h2">Architecture</Title>
                        {isLoading && !overviewFlow ? <ProgressRing sx={{ height: '16px', width: '16px' }} /> : generateButton()}
                    </CardTitleContainer>
                    <Diagram
                        project={overviewFlow ? overviewFlow as Project : project}
                        onAddEntryPoint={handleAddArtifact}
                        onAddConnection={handleAddConnection}
                        onEntryPointSelect={handleGoToEntryPoints}
                        onConnectionSelect={handleGoToConnection}
                    />
                    <ContentFooter>
                        <Title variant="h2">Quick Actions</Title>
                        <LinkButton onClick={() => { }} sx={{ fontSize: 14, padding: 8, color: Colors.PRIMARY, gap: 4 }}>
                            <Codicon name={"output"} iconSx={{ fontSize: 16 }} sx={{ height: 16 }} />
                            Import your schema
                        </LinkButton>
                        <LinkButton onClick={() => { }} sx={{ fontSize: 14, padding: 8, color: Colors.PRIMARY, gap: 4 }}>
                            <Codicon name={"settings"} iconSx={{ fontSize: 16 }} sx={{ height: 16 }} />
                            Add your configurations
                        </LinkButton>
                        <LinkButton onClick={() => { }} sx={{ fontSize: 14, padding: 8, color: Colors.PRIMARY, gap: 4 }}>
                            <Codicon name={"cloud"} iconSx={{ fontSize: 16 }} sx={{ height: 16 }} />
                            Create connector from Open API
                        </LinkButton>
                    </ContentFooter>
                </Content>
            </ViewContent>
        </View >
    );
}

export default ComponentDiagram;
