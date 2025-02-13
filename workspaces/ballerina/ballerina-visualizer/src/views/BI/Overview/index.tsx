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
    MACHINE_VIEW,
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
    Icon,
} from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { BIHeader } from "../BIHeader";
import { Colors } from "../../../resources/constants";
import { getProjectFromResponse, parseSSEEvent, replaceCodeBlocks, splitContent } from "../../AIPanel/AIChat";
import ComponentDiagram from "../ComponentDiagram";
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import ReactMarkdown from "react-markdown";
import { TopNavigationBar } from "../../../components/TopNavigationBar";
import { MainTitleBar } from "../../../components/MainTitleBar";

const CardTitleContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    border-bottom: 1px solid var(--vscode-dropdown-border);
    padding: 5px 10px;
`;

const SpinnerContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
`;

const Title = styled(Typography)`
    margin: 8px 0;
`;

const Description = styled(Typography)`
    color: var(--vscode-descriptionForeground);
`;

const ButtonContainer = styled.div`
    display: flex;
    align-items: flex-end;
    gap: 8px;
`;

const EmptyStateContainer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const PageLayout = styled.div`
    height: 100vh;
    display: grid;
    grid-template-rows: auto 1fr auto;
    gap: 16px;
    padding: 16px;
`;

const HeaderRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: var(--vscode-editor-background);
    border-bottom: 1px solid var(--vscode-dropdown-border);
`;

const MainContent = styled.div`
    display: grid;
    grid-template-columns: 3fr 1fr;
    gap: 16px;
    min-height: 0; // Prevents grid blowout
    height: 60vh; // Takes majority of the viewport height
`;

const MainPanel = styled.div`
    background: var(--vscode-sideBar-background);
    border: 1px solid var(--vscode-dropdown-border);
    border-radius: 4px;
    padding: 16px;
    overflow: auto;
    display: flex;
    flex-direction: column;
`;

const SidePanel = styled.div`
    background: var(--vscode-sideBar-background);
    border: 1px solid var(--vscode-dropdown-border);
    border-radius: 4px;
    padding: 16px;
    overflow: auto;
`;

const FooterPanel = styled.div`
    background: var(--vscode-sideBar-background);
    border: 1px solid var(--vscode-dropdown-border);
    border-radius: 4px;
    padding: 16px;
    overflow: auto;
    height: calc(40vh - 32px - 64px); // Remaining viewport height minus padding and gaps
`;

const ActionContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
`;

const EmptyReadmeContainer = styled.div`
    display: flex;
    margin-top: 50px;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    justify-content: center;
    height: 100%;
`;

const DiagramHeaderContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
`;

const DiagramContent = styled.div`
    flex: 1;
    min-height: 0; // Prevents flex blowout
    position: relative;
`;

const DeploymentContent = styled.div`
    margin-top: 16px;
`;

const DeployButtonContainer = styled.div`
    margin-top: 16px;
`;

const ReadmeHeaderContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
`;

const ReadmeContent = styled.div`
    margin-top: 16px;
`;

const TitleContainer = styled.div`
    display: flex;
    align-items: flex-end;
    gap: 8px;
`;

const ProjectTitle = styled.h1`
    font-weight: bold;
    font-size: 1.5rem;
    text-transform: capitalize;
    margin-bottom: 0;
    margin-top: 0;
    @media (min-width: 768px) {
        font-size: 1.875rem;
    }
`;

const ProjectSubtitle = styled.h2`
    display: none;
    font-weight: 200;
    font-size: 1.5rem;
    opacity: 0.3;
    margin-bottom: 0;
    margin-top: 0;
    @media (min-width: 640px) {
        display: block;
    }

    @media (min-width: 768px) {
        font-size: 1.875rem;
    }
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

        rpcClient
            .getBIDiagramRpcClient()
            .getReadmeContent()
            .then((res) => {
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
        return Object.values(projectStructure.directoryMap || {}).every((array) => array.length === 0);
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
            readme: false,
        });
    };

    const handleReadmeGenerate = () => {
        rpcClient.getBIDiagramRpcClient().openAIChat({
            scafold: true,
            readme: true,
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

    return (
        <PageLayout>
            <HeaderRow>
                <TitleContainer>
                    <ProjectTitle>{projectName}</ProjectTitle>
                    <ProjectSubtitle>Integration</ProjectSubtitle>
                </TitleContainer>
                <ButtonContainer>
                    <VSCodeButton appearance="icon" title="Run Integration" onClick={handlePlay}>
                        <Codicon name="play" sx={{ marginRight: 5 }} /> Run
                    </VSCodeButton>
                    <VSCodeButton appearance="icon" title="Build Integration" onClick={handleBuild}>
                        <Icon name="bi-build" sx={{ marginRight: 8, fontSize: 16 }} /> Build
                    </VSCodeButton>
                    {/* <VSCodeButton appearance="secondary" onClick={handleDeploy}>
                        <Icon name="bi-deploy" sx={{ marginRight: 8, fontSize: 16 }} /> Deploy
                    </VSCodeButton> */}
                </ButtonContainer>
            </HeaderRow>

            <MainContent>
                <MainPanel>
                    <DiagramHeaderContainer>
                        <Title variant="h2">Design</Title>
                        <ActionContainer>
                            <VSCodeButton appearance="icon" title="Generate with AI" onClick={handleGenerate}>
                                <Codicon name="wand" sx={{ marginRight: 5 }} /> Generate
                            </VSCodeButton>
                            <VSCodeButton appearance="primary" onClick={handleAddConstruct}>
                                <Codicon name="add" sx={{ marginRight: 5 }} /> Add Construct
                            </VSCodeButton>
                        </ActionContainer>
                    </DiagramHeaderContainer>
                    <DiagramContent>
                        {isEmptyProject() ? (
                            <EmptyStateContainer>
                                <Typography variant="h3" sx={{ marginBottom: "16px" }}>
                                    Your project is empty
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{ marginBottom: "24px", color: "var(--vscode-descriptionForeground)" }}
                                >
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
                            </EmptyStateContainer>
                        ) : (
                            <ComponentDiagram projectName={projectName} projectStructure={projectStructure} />
                        )}
                    </DiagramContent>
                </MainPanel>

                <SidePanel>
                    <Title variant="h2">Deployment</Title>
                    <DeploymentContent>
                        <Description variant="body2">
                            Easily deploy the integration to the cloud using Choreo. Click the Deploy button to continue with the deployment.
                        </Description>
                        <DeployButtonContainer>
                            <VSCodeButton appearance="primary" onClick={handleDeploy}>
                                <Codicon name="cloud-upload" sx={{ marginRight: 5 }} /> Deploy
                            </VSCodeButton>
                        </DeployButtonContainer>
                    </DeploymentContent>
                </SidePanel>
            </MainContent>

            <FooterPanel>
                <ReadmeHeaderContainer>
                    <Title variant="h2">README</Title>
                    <VSCodeButton appearance="icon" title="Edit README" onClick={handleEditReadme}>
                        <Codicon name="edit" sx={{ marginRight: 5 }} /> Edit
                    </VSCodeButton>
                </ReadmeHeaderContainer>
                <ReadmeContent>
                    {readmeContent ? (
                        <ReactMarkdown>{readmeContent}</ReactMarkdown>
                    ) : (
                        <EmptyReadmeContainer>
                            <Description variant="body2">
                                Describe your integration and generate your constructs with AI
                            </Description>
                            <VSCodeLink onClick={handleEditReadme}>Add a README</VSCodeLink>
                        </EmptyReadmeContainer>
                    )}
                </ReadmeContent>
            </FooterPanel>
        </PageLayout>
    );
}
