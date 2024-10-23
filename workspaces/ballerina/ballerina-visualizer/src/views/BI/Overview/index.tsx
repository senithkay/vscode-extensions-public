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
    ProjectDiagnostics,
    ProjectSource,
    ProjectStructureResponse,
    EVENT_TYPE,
    MACHINE_VIEW
} from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import {
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
import { Colors } from "../../../resources/constants";
import { getProjectFromResponse, parseSSEEvent, replaceCodeBlocks, splitContent } from "../../AIPanel/AIChat";
import ComponentDiagram from "../ComponentDiagram";
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import ReactMarkdown from 'react-markdown';

const CardTitleContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 24px;
`;

const SpinnerContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
`;

const Content = styled.div`
    height: 100%;
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

const Readme = styled.div`
    border: 1px solid var(--vscode-input-border);
    border-radius: 4px;
    padding: 16px;
    overflow-y: auto;
    min-height: 300px;
`;

interface ComponentDiagramProps {
    //
}

export function Overview(props: ComponentDiagramProps) {

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

        rpcClient.getBIDiagramRpcClient().getReadmeContent().then((res) => {
            setReadmeContent(res.content);
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
                rpcClient.getAiPanelRpcClient().addToProject({ content: code, filePath: file });
            }
        });
    }, [responseText]);

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
                rpcClient.getAiPanelRpcClient().addToProject({ content: "", filePath: file });
            }
        });

        setResponseText("");
    };

    function isEmptyProject(): boolean {
        return Object.values(projectStructure.directoryMap || {}).every(array => array.length === 0);
    }

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
        let functions: any;
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
                        functions = event.body;
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
                        const newSourceFiles: ProjectSource = getProjectFromResponse(assistant_response);
                        // Check diagnostics
                        const diags: ProjectDiagnostics = await rpcClient
                            .getAiPanelRpcClient()
                            .getShadowDiagnostics(newSourceFiles);
                        if (diags.diagnostics.length > 0) {
                            console.log("Diagnostics : ");
                            console.log(diags.diagnostics);
                            const diagReq = {
                                response: assistant_response,
                                diagnostics: diags.diagnostics,
                            };
                            const startTime = performance.now();
                            const response = await fetch(url + "/code/repair", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    usecase: readmeContent,
                                    diagnosticRequest: diagReq,
                                    functions: functions,
                                }),
                                signal: signal,
                            });
                            if (!response.ok) {
                                console.log("repair error");
                                setIsLoading(false);
                            } else {
                                const jsonBody = await response.json();
                                const repairResponse = jsonBody.repairResponse;
                                // replace original response with new code blocks
                                const fixedResponse = replaceCodeBlocks(assistant_response, repairResponse);
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
                <LinkButton onClick={() => { }} sx={{ fontSize: 14, padding: 8, color: Colors.PRIMARY, gap: 8 }}>
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
                    <LinkButton onClick={() => { }} sx={{ fontSize: 14, padding: 8, color: Colors.PRIMARY, gap: 8 }}>
                        <ProgressRing sx={{ height: "16px", width: "16px" }} />
                        Applying changes to the project...
                    </LinkButton>
                );
            }
        }

        return component;
    };

    if (!projectStructure) {
        return (
            <SpinnerContainer>
                <ProgressRing color={Colors.PRIMARY} />
            </SpinnerContainer>
        );
    }

    const handleAddConstruct = () => {
        rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.BIComponentView,
            },
        });
    };

    const handleDeploy = () => {
        rpcClient.getBIDiagramRpcClient().deployProject();
    };

    const handleGenerate = () => {
        rpcClient.getBIDiagramRpcClient().openAIChat({
            scafold: true,
        });

    };

    const handleEditReadme = () => {
        rpcClient.getBIDiagramRpcClient().openReadme();
    };

    const handlePlay = () => {
        rpcClient.getBIDiagramRpcClient().runProject();
    };

    const handleBuild = () => {
        rpcClient.getBIDiagramRpcClient().buildProject();
    };



    const getActionButtons = (): React.ReactNode[] => {
        return [
            <VSCodeButton key="run" appearance="icon" title="Run" onClick={handlePlay}>
                <Codicon name="play" sx={{ marginRight: 5 }} /> Run
            </VSCodeButton>,
            <VSCodeButton key="build" appearance="icon" title="Build" onClick={handleBuild}>
                <Codicon name="package" sx={{ marginRight: 5 }} /> Build
            </VSCodeButton>,
            <VSCodeButton key="deploy" appearance="icon" title="Deploy" onClick={handleDeploy}>
                <Codicon name="cloud-upload" sx={{ marginRight: 5 }} /> Deploy
            </VSCodeButton>,
            <VSCodeButton key="generate" appearance="icon" title="Generate with AI" onClick={handleGenerate}>
                <Codicon name="wand" sx={{ marginRight: 5 }} /> Generate
            </VSCodeButton>,
            <VSCodeButton key="add-construct" appearance="primary" title="Generate with AI" onClick={handleAddConstruct}>
                <Codicon name="add" sx={{ marginRight: 5 }} /> Add Construct
            </VSCodeButton>
        ];
    };

    // TODO: Refactor this component with meaningful components
    return (
        <View>
            <ViewContent padding>
                <BIHeader actions={getActionButtons()} />
                <Content>
                    <CardTitleContainer>
                        <Title variant="h2">Architecture</Title>
                        {/* {generateButton()} */}
                    </CardTitleContainer>
                    {isEmptyProject() ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', border: '1px dashed var(--vscode-input-border)', borderRadius: '4px', padding: '20px', textAlign: 'center' }}>
                            <Typography variant="h3" sx={{ marginBottom: '16px' }}>
                                Your project is empty
                            </Typography>
                            <Typography variant="body1" sx={{ marginBottom: '24px', color: 'var(--vscode-descriptionForeground)' }}>
                                Start by adding constructs or use AI to generate your project structure
                            </Typography>
                            <ButtonContainer>
                                <VSCodeButton appearance="primary" onClick={handleAddConstruct}>
                                    <Codicon name="add" sx={{ marginRight: 5 }} /> Add Construct
                                </VSCodeButton>
                                <VSCodeButton appearance="secondary" onClick={handleGenerate}>
                                    <Codicon name="wand" sx={{ marginRight: 5 }} /> Generate with AI
                                </VSCodeButton>
                            </ButtonContainer>
                        </div>
                    ) : (
                        <ComponentDiagram projectName={projectName} projectStructure={projectStructure} />
                    )}
                    <CardTitleContainer>
                        <Title variant="h2">Readme</Title>
                        {readmeContent && isEmptyProject() && (
                            <VSCodeButton appearance="icon" title="Scaffold Integration with Readme" onClick={handleGenerate}>
                                <Codicon name="wand" sx={{ marginRight: 5 }} /> Scaffold Integration with Readme
                            </VSCodeButton>
                        )}
                        <VSCodeButton appearance="icon" title="Edit Readme" onClick={handleEditReadme}>
                            <Codicon name="edit" sx={{ marginRight: 5 }} /> Edit
                        </VSCodeButton>
                    </CardTitleContainer>
                    <Readme>
                        {readmeContent ? (
                            <ReactMarkdown>{readmeContent}</ReactMarkdown>
                        ) : (
                            <div style={{ display: 'flex', marginTop: '20px', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                <Typography variant="h3" sx={{ marginBottom: '16px' }}>
                                    Add a README
                                </Typography>
                                <Typography variant="body1" sx={{ marginBottom: '24px', color: 'var(--vscode-descriptionForeground)' }}>
                                    Describe your integration and generate your constructs with AI
                                </Typography>
                                <VSCodeLink onClick={handleEditReadme}>
                                    Add a README
                                </VSCodeLink>
                            </div>
                        )}
                    </Readme>
                </Content>
            </ViewContent>
        </View>
    );
}

