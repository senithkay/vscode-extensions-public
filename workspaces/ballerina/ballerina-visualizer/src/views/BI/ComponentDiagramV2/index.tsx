/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef, useState } from "react";
import {
    DIRECTORY_MAP,
    EVENT_TYPE,
    MACHINE_VIEW,
    ProjectDiagnostics,
    ProjectSource,
    ProjectStructureResponse,
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
import { BodyText } from "../../styles";
import { Colors } from "../../../resources/constants";
import { getProjectFromResponse, parseSSEEvent, replaceCodeBlocks, splitContent } from "../../AIPanel/AIChat";

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

export function ComponentDiagramV2(props: ComponentDiagramProps) {
    const { rpcClient } = useRpcContext();
    const [projectName, setProjectName] = React.useState<string>("");
    const [readmeContent, setReadmeContent] = React.useState<string>("");
    const [isCodeGenerating, setIsCodeGenerating] = React.useState<boolean>(false);
    const [projectStructure, setProjectStructure] = React.useState<ProjectStructureResponse>();

    const [responseText, setResponseText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const backendRootUri = useRef("");

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

        // setResponseText("");

        // Fetching the backend root URI
        rpcClient
            .getAiPanelRpcClient()
            .getBackendURL()
            .then((res) => {
                backendRootUri.current = res;
            });
    };

    rpcClient?.onProjectContentUpdated((state: boolean) => {
        if (state) {
            fetchContext();
        }
    });

    useEffect(() => {
        fetchContext();
    }, []);

    useEffect(() => {
        console.log(">>> ai responseText", { responseText });
        if (!responseText) {
            return;
        }
        const segments = splitContent(responseText);
        console.log(">>> ai code", { segments });

        segments.forEach((segment) => {
            if (segment.isCode) {
                let code = segment.text;
                let file = segment.fileName;
                rpcClient.getAiPanelRpcClient().addToProject({ content: code, filePath:file });
            }
        });

    }, [responseText]);

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

    const handleGoToConnection = (connection: Connection) => {
        if (connection.location) {
            goToView(connection.location.filePath, connection.location.position);
        }
    };

    const handleSaveOverview = (value: string) => {
        rpcClient.getBIDiagramRpcClient().handleReadmeContent({ content: value, read: false });
        setReadmeContent(value);
    };

    const handleOverviewGenerate = async () => {
        fetchAiResponse();
    };

    const handleDiagramOnAccept = async () => {
        setIsCodeGenerating(true);
        setResponseText("");
        // HACK: code is already added to the project. here just show feedback
        setTimeout(() => {
            setIsCodeGenerating(false);
        }, 2000);
    };

    const handleDiagramOnReject = () => {
        // INFO: forcefully clear the response text and files
        if (!responseText) {
            return;
        }
        const segments = splitContent(responseText);

        segments.forEach((segment) => {
            if (segment.isCode) {
                let file = segment.fileName;
                rpcClient.getAiPanelRpcClient().addToProject({ content: "", filePath:file });
            }
        });

        setResponseText("");
    };

    async function fetchAiResponse(isQuestion: boolean = false) {
        if (readmeContent === "" && !isQuestion) {
            return;
        }

        setIsLoading(true);
        setLoadingMessage("Reading...");
        let assistant_response = "";
        const controller = new AbortController();
        const signal = controller.signal;
        const url = backendRootUri.current;
        const response = await fetch(url + "/code", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ usecase: readmeContent, chatHistory: [] }),
            signal: signal,
        });
        if (!response.ok) {
            setIsLoading(false);
            throw new Error("Failed to fetch response");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let functions : any;
        let buffer = "";
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                setIsLoading(false);
                break;
            }

            buffer += decoder.decode(value, { stream: true });

            let boundary = buffer.indexOf("\n\n");
            while (boundary !== -1) {
                const chunk = buffer.slice(0, boundary + 2);
                buffer = buffer.slice(boundary + 2);

                try {
                    const event = parseSSEEvent(chunk);
                    if (event.event == "libraries") {
                        setLoadingMessage("Looking for libraries...");
                    } else if (event.event == "functions") {
                        functions = event.body
                        setLoadingMessage("Fetching functions...");
                    } else if (event.event == "content_block_delta") {
                        let textDelta = event.body.text;
                        assistant_response += textDelta;
                        console.log(">>> Text Delta: " + textDelta);
                        setLoadingMessage("Generating components...");
                    } else if (event.event == "message_stop") {
                        console.log(">>> Streaming stop: ", { responseText, assistant_response });
                        setLoadingMessage("Verifying components...");
                        console.log(assistant_response);
                        const newSourceFiles: ProjectSource = getProjectFromResponse(assistant_response)
                        // Check diagnostics
                        const diags: ProjectDiagnostics = await rpcClient.getAiPanelRpcClient().getShadowDiagnostics(newSourceFiles);
                        if (diags.diagnostics.length > 0) {
                            console.log("Diagnostics : ")
                            console.log(diags.diagnostics)
                            const diagReq = {
                                "response": assistant_response,
                                "diagnostics": diags.diagnostics
                            }
                            const startTime = performance.now();
                            const response = await fetch(url + "/code/repair", {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ "usecase": readmeContent, diagnosticRequest: diagReq, functions: functions }),
                                signal: signal,
                            });
                            if (!response.ok) {
                                console.log("repair error");
                                setIsLoading(false);
                            } else {
                                const jsonBody = await response.json();
                                const repairResponse = jsonBody.repairResponse;
                                // replace original response with new code blocks
                                const fixedResponse = replaceCodeBlocks(assistant_response, repairResponse)
                                const endTime = performance.now();
                                const executionTime = endTime - startTime;
                                console.log(`Repair call time: ${executionTime} milliseconds`);
                                assistant_response = fixedResponse;
                            }
                        }
                        setResponseText(assistant_response);
                        setIsLoading(false);
                    } else if (event.event == "error") {
                        console.log(">>> Streaming Error: " + event.body);
                        setIsLoading(false);
                    }
                } catch (error) {
                    console.error("Failed to parse SSE event:", error);
                }

                boundary = buffer.indexOf("\n\n");
            }
        }
    }

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
        if (isLoading) {
            component = (
                <LinkButton onClick={() => {}} sx={{ fontSize: 14, padding: 8, color: Colors.PRIMARY, gap: 8 }}>
                    <ProgressRing sx={{ height: "16px", width: "16px" }} />
                    {loadingMessage || "Reading project overview..."}
                </LinkButton>
            );
        }
        if (responseText) {
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

    // TODO: Refactor this component with meaningful components
    return (
        <View>
            <ViewContent padding>
                <BIHeader />
                <Content>
                    <Title variant="h2">Project Overview V2</Title>
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
                    <CardTitleContainer>
                        <Title variant="h2">Architecture</Title>
                        {generateButton()}
                    </CardTitleContainer>
                    <DiagramContainer>
                        <Diagram
                            project={project}
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

export default ComponentDiagramV2;
