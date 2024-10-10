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
    OverviewFlow,
} from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { Connection, Diagram, EntryPoint, NodePosition, Project } from "@wso2-enterprise/component-diagram";
import {
    TextArea,
    Typography,
    View,
    ViewContent,
    LinkButton,
    Codicon,
    ProgressRing,
    Button,
} from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { BIHeader } from "../BIHeader";
import { BodyText, BodyTinyInfo } from "../../styles";
import { Colors } from "../../../resources/constants";

const CardTitleContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 24px;
`;

const Content = styled.div`
    height: 100%;
`;

const DiagramContainer = styled.div`
    height: 400px;
`;

const ContentFooter = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Title = styled(Typography)`
    margin: 8px 0;
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 8px;
`;

interface ComponentDiagramProps {
    stateUpdated: boolean;
}

export function ComponentDiagramV1(props: ComponentDiagramProps) {
    const { rpcClient } = useRpcContext();
    const [projectName, setProjectName] = React.useState<string>("");
    const [readmeContent, setReadmeContent] = React.useState<string>("");
    const [isModelGenerating, setIsModelGenerating] = React.useState<boolean>(false);
    const [isCodeGenerating, setIsCodeGenerating] = React.useState<boolean>(false);
    const [overviewFlow, setOverviewFlow] = React.useState<OverviewFlow>(null);
    const [projectStructure, setProjectStructure] = React.useState<ProjectStructureResponse>();

    const fetchContext = () => {
        rpcClient
            .getBIDiagramRpcClient()
            .getProjectStructure()
            .then((res) => {
                setProjectStructure(res);
            });
        rpcClient
            .getBIDiagramRpcClient()
            .getWorkspaces()
            .then((res) => {
                setProjectName(res.workspaces[0].name);
            });

        rpcClient
            .getBIDiagramRpcClient()
            .handleReadmeContent({ read: true })
            .then((res) => {
                setReadmeContent(res.content);
            });

        setOverviewFlow(null);
    };

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
        // rpcClient.getVisualizerRpcClient().openView({
        //     type: EVENT_TYPE.OPEN_VIEW,
        //     location: {
        //         view: MACHINE_VIEW.AddConnectionWizard,
        //     },
        //     isPopup: true
        // });
    };

    const handleGoToConnection = (connection: Connection) => {
        if (connection.location) {
            goToView(connection.location.filePath, connection.location.position);
        }
    };

    // TODO: improve loading ux
    if (!projectStructure) {
        return <>Loading...</>;
    }

    const project: Project = {
        name: projectName,
        entryPoints: [],
        connections: [],
    };
    // generate project structure
    projectStructure.directoryMap[DIRECTORY_MAP.SERVICES].forEach((service) => {
        project.entryPoints.push({
            id: service.name,
            name: service.name,
            type: "service",
            location: {
                filePath: service.path,
                position: service.position,
            },
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
            },
        });
    });

    const handleSaveOverview = (value: string) => {
        rpcClient.getBIDiagramRpcClient().handleReadmeContent({ content: value, read: false });
        setReadmeContent(value);
    };

    const handleOverviewGenerate = async () => {
        setIsModelGenerating(true);
        const suggestion = await rpcClient
            .getBIDiagramRpcClient()
            .getAiSuggestions({ filePath: null, position: null, isOverview: true });
        setOverviewFlow(suggestion.overviewFlow);
        setIsModelGenerating(false);
        console.log(">>> component diagram: overview flow", suggestion.overviewFlow);
    };

    const handleDiagramOnAccept = async () => {
        setIsCodeGenerating(true);
        const res = await rpcClient.getBIDiagramRpcClient().createComponents({ overviewFlow });
        setIsCodeGenerating(false);
        if (res.response) {
            fetchContext();
        }
    };

    const handleDiagramOnReject = () => {
        setOverviewFlow(null);
    };

    const generateButton = () => {
        let component = (
            <LinkButton
                onClick={handleOverviewGenerate}
                sx={{ fontSize: 14, padding: 8, color: Colors.PRIMARY, gap: 8 }}
            >
                <Codicon name={"wand"} iconSx={{ fontSize: 16 }} sx={{ height: 16 }} />
                Generate components using overview
            </LinkButton>
        );
        if (isModelGenerating) {
            component = (
                <LinkButton onClick={() => {}} sx={{ fontSize: 14, padding: 8, color: Colors.PRIMARY, gap: 8 }}>
                    <ProgressRing sx={{ height: "16px", width: "16px" }} />
                    Generating components...
                </LinkButton>
            );
        }
        if (overviewFlow) {
            component = (
                <ButtonContainer>
                    <Button appearance="primary" onClick={handleDiagramOnAccept}>
                        Accept
                    </Button>
                    <Button appearance="secondary" onClick={handleDiagramOnReject}>
                        Reject
                    </Button>
                </ButtonContainer>
            );
            if (isCodeGenerating) {
                component = (
                    <LinkButton onClick={() => {}} sx={{ fontSize: 14, padding: 8, color: Colors.PRIMARY, gap: 8 }}>
                        <ProgressRing sx={{ height: "16px", width: "16px" }} />
                        Applying changes to the project...
                    </LinkButton>
                );
            }
        }

        return component;
    };

    console.log(">>> component diagram: project", { project, overviewFlow });

    // TODO: Refactor this component with meaningful components
    return (
        <View>
            <ViewContent padding>
                <BIHeader />
                <Content>
                    <Title variant="h2">Project Overview</Title>
                    <BodyText>
                        To create a tailored integration solution, please provide a brief description of your project.
                        What problem are you trying to solve? What systems or data sources will be involved?
                    </BodyText>
                    <TextArea
                        placeholder="E.g. A webhook to trigger an email notification. Accept JSON payloads with event details and send an email based on the event type. Include error handling for invalid data."
                        rows={6}
                        style={{ width: "100%" }}
                        value={readmeContent}
                        onKeyUp={(e) => handleSaveOverview(e.currentTarget.value)}
                    />
                    {/* <BodyTinyInfo>
                        This information will be used to generate an optimized and tailored integration solution.
                    </BodyTinyInfo> */}
                    <CardTitleContainer>
                        <Title variant="h2">Architecture</Title>
                        {generateButton()}
                    </CardTitleContainer>
                    <DiagramContainer>
                        <Diagram
                            project={
                                overviewFlow &&
                                (overviewFlow.connections.length > 0 || overviewFlow.entryPoints.length > 0)
                                    ? (overviewFlow as Project)
                                    : project
                            }
                            onAddEntryPoint={handleAddArtifact}
                            onAddConnection={handleAddConnection}
                            onEntryPointSelect={handleGoToEntryPoints}
                            onConnectionSelect={handleGoToConnection}
                        />
                    </DiagramContainer>
                    <ContentFooter>
                        <Title variant="h2">Quick Actions</Title>
                        <LinkButton onClick={() => {}} sx={{ fontSize: 14, padding: 8, color: Colors.PRIMARY, gap: 8 }}>
                            <Codicon name={"output"} iconSx={{ fontSize: 16 }} sx={{ height: 16 }} />
                            Import your schema
                        </LinkButton>
                        <LinkButton onClick={() => {}} sx={{ fontSize: 14, padding: 8, color: Colors.PRIMARY, gap: 8 }}>
                            <Codicon name={"settings"} iconSx={{ fontSize: 16 }} sx={{ height: 16 }} />
                            Add your configurations
                        </LinkButton>
                        <LinkButton onClick={() => {}} sx={{ fontSize: 14, padding: 8, color: Colors.PRIMARY, gap: 8 }}>
                            <Codicon name={"cloud"} iconSx={{ fontSize: 16 }} sx={{ height: 16 }} />
                            Create connector from Open API
                        </LinkButton>
                    </ContentFooter>
                </Content>
            </ViewContent>
        </View>
    );
}

export default ComponentDiagramV1;
