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
    BuildMode,
    BI_COMMANDS,
    DevantComponent
} from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { Typography, Codicon, ProgressRing, Button, Icon, Divider, CheckBox, ProgressIndicator, Overlay } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { ThemeColors } from "@wso2-enterprise/ui-toolkit";
import { getProjectFromResponse, parseSSEEvent, replaceCodeBlocks, splitContent } from "../../AIPanel/AIChat";
import ComponentDiagram from "../ComponentDiagram";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import ReactMarkdown from "react-markdown";

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

const IconButtonContainer = styled.div`
    display: flex;
    align-items: flex-end;
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
    padding: 16px 0 16px 16px;
    background: var(--vscode-editor-background);
    border-bottom: 1px solid var(--vscode-dropdown-border);
`;

const HeaderControls = styled.div`
    display: flex;
    gap: 8px;
    margin-right: 16px;
`;

const MainContent = styled.div`
    display: grid;
    grid-template-columns: 3fr 1fr;
    gap: 16px;
    min-height: 0; // Prevents grid blowout
    height: 60vh; // Takes majority of the viewport height
`;

const MainPanel = styled.div<{ noPadding?: boolean }>`
    border: 1px solid ${ThemeColors.OUTLINE_VARIANT};
    border-radius: 4px;
    padding: ${(props: { noPadding: boolean; }) => (props.noPadding ? "0" : "16px")};
    overflow: auto;
    display: flex;
    flex-direction: column;
`;

const SidePanel = styled.div`
    padding: 0px 10px 10px 10px;
    overflow: auto;
`;

const FooterPanel = styled.div`
    border: 1px solid ${ThemeColors.OUTLINE_VARIANT};
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

const DiagramHeaderContainer = styled.div<{ withPadding?: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: ${(props: { withPadding: boolean; }) => (props.withPadding ? "16px 16px 0 16px" : "0")};
`;

const DiagramContent = styled.div`
    flex: 1;
    min-height: 0; // Prevents flex blowout
    position: relative;
`;

const DeploymentContent = styled.div`
    margin-top: 16px;
    min-width: 130px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    color: var(--vscode-descriptionForeground);

    h3 {
        margin: 0 0 16px 0;
        color: inherit;
    }

    p {
        color: inherit;
    }
`;

const DeployButtonContainer = styled.div`
    margin-top: 16px;
    margin-bottom: 16px;
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

const DeployButton = styled.div`
    border: 1px solid var(--vscode-welcomePage-tileBorder);
    cursor: default !important;
    background: var(--vscode-welcomePage-tileBackground);
    border-radius: 6px;
    display: flex;
    overflow: hidden;
    width: 100%;
    padding: 10px;
    flex-direction: column;
`;

const DeploymentOptionContainer = styled.div<{ isExpanded: boolean }>`
    cursor: pointer;
    border: ${props => props.isExpanded ? '1px solid var(--vscode-welcomePage-tileBorder)' : 'none'};
    background: ${props => props.isExpanded ? 'var(--vscode-welcomePage-tileBackground)' : 'transparent'};
    border-radius: 6px;
    display: flex;
    overflow: hidden;
    width: 100%;
    padding: 10px;
    flex-direction: column;
    margin-bottom: 8px;

    &:hover {
        background: var(--vscode-welcomePage-tileHoverBackground);
    }
`;

const DeploymentHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    h3 {
        font-size: 13px;
        font-weight: 600;
        margin: 0;
    }
`;

const DeploymentBody = styled.div<{ isExpanded: boolean }>`
    max-height: ${props => props.isExpanded ? '200px' : '0'};
    overflow: hidden;
    transition: max-height 0.3s ease-in-out;
    margin-top: ${props => props.isExpanded ? '8px' : '0'};
`;

interface DeploymentOptionProps {
    title: string;
    description: string;
    buttonText: string;
    isExpanded: boolean;
    onToggle: () => void;
    onDeploy: () => void;
    learnMoreLink?: string;
    isDeploying?: boolean;
}

function DeploymentOption({
    title,
    description,
    buttonText,
    isExpanded,
    onToggle,
    onDeploy,
    learnMoreLink,
    isDeploying
}: DeploymentOptionProps) {
    const { rpcClient } = useRpcContext();

    const openLearnMoreURL = () => {
        rpcClient.getCommonRpcClient().openExternalUrl({
            url: learnMoreLink
        })
    };

    return (
        <DeploymentOptionContainer
            isExpanded={isExpanded}
            onClick={onToggle}
        >
            {isDeploying && <ProgressIndicator />}
            <DeploymentHeader>
                <Codicon
                    name={'circle-outline'}
                    sx={{ color: isExpanded ? 'var(--vscode-textLink-foreground)' : 'inherit' }}
                />
                <h3>{title}</h3>
            </DeploymentHeader>
            <DeploymentBody isExpanded={isExpanded}>
                <p style={{ marginTop: 8 }}>
                    {description}
                    {learnMoreLink && (
                        <VSCodeLink onClick={openLearnMoreURL} style={{ marginLeft: '4px' }}>Learn more</VSCodeLink>
                    )}
                </p>
                <Button appearance="secondary" onClick={(e) => {
                    e.stopPropagation();
                    onDeploy();
                }}>
                    {buttonText}
                </Button>
            </DeploymentBody>
        </DeploymentOptionContainer>
    );
}

interface DeploymentOptionsProps {
    handleDockerBuild: () => void;
    handleJarBuild: () => void;
    handleDeploy: () => Promise<void>;
    goToDevant: (devantComponent: DevantComponent) => void;
    devantComponent: DevantComponent | undefined;
}

function DeploymentOptions({ handleDockerBuild, handleJarBuild, handleDeploy, goToDevant, devantComponent }: DeploymentOptionsProps) {
    const [expandedOptions, setExpandedOptions] = useState<Set<string>>(new Set(['cloud', 'devant']));
    const [isDeploying, setIsDeploying] = useState(false);

    const toggleOption = (option: string) => {
        setExpandedOptions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(option)) {
                newSet.delete(option);
            } else {
                newSet.add(option);
            }
            return newSet;
        });
    };

    const handleDeployToDevant = async () => {
        setIsDeploying(true);
        await handleDeploy();
        setIsDeploying(false);
    };

    return (
        <>
            <div>
                <Title variant="h3">Deployment Options</Title>

                {(devantComponent == undefined)  &&
                    <DeploymentOption
                        title="Deploy to Devant"
                        description="Deploy your integration to the cloud using Devant by WSO2."
                        buttonText="Deploy"
                        isExpanded={expandedOptions.has('cloud')}
                        onToggle={() => toggleOption('cloud')}
                        onDeploy={handleDeployToDevant}
                        learnMoreLink={"https://wso2.com/devant/docs"}
                        isDeploying={isDeploying}
                    />
                }

                {devantComponent != undefined &&
                    <DeploymentOption
                        title="Deployed in Devant"
                        description="This integration is already deployed in Devant."
                        buttonText="View in Devant"
                        isExpanded={expandedOptions.has('devant')}
                        onToggle={() => toggleOption('devant')}
                        onDeploy={() => goToDevant(devantComponent)}
                        learnMoreLink={"https://wso2.com/devant/docs"}
                    />
                }

                <DeploymentOption
                    title="Deploy with Docker"
                    description="Create a Docker image of your integration and deploy it to any Docker-enabled system."
                    buttonText="Create Docker Image"
                    isExpanded={expandedOptions.has('docker')}
                    onToggle={() => toggleOption('docker')}
                    onDeploy={handleDockerBuild}
                />

                <DeploymentOption
                    title="Deploy on a VM"
                    description="Create a self-contained Ballerina executable and run it on any system with Java installed."
                    buttonText="Create Executable"
                    isExpanded={expandedOptions.has('vm')}
                    onToggle={() => toggleOption('vm')}
                    onDeploy={handleJarBuild}
                />
            </div>
            {
                isDeploying
                    && <Overlay sx={{ background: `${ThemeColors.SURFACE_CONTAINER}`, opacity: `0.3`, zIndex: 1000 }} />
            }
        </>
    );
}

interface IntegrationControlPlaneProps {
    enabled: boolean;
    handleICP: (checked: boolean) => void;
}

function IntegrationControlPlane({ enabled, handleICP }: IntegrationControlPlaneProps) {
    const { rpcClient } = useRpcContext();

    const openLearnMoreURL = () => {
        rpcClient.getCommonRpcClient().openExternalUrl({
            url: "https://wso2.com/integrator/integration-control-plane/"
        })
    };

    return (
        <div>
            <Title variant="h3">Integration Control Plane</Title>
            <p>
                {"Moniter the deployment runtime using WSO2 Integration Control Plane."}
                <VSCodeLink onClick={openLearnMoreURL} style={{ marginLeft: '4px' }}> Learn More </VSCodeLink>
            </p>
            <CheckBox
                checked={enabled}
                onChange={handleICP}
                label="Enable ICP"
            />
        </div>
    );
}

interface ComponentDiagramProps {
    projectPath: string;
    deployedComponent?: DevantComponent;
}

export function Overview(props: ComponentDiagramProps) {
    const { projectPath, deployedComponent } = props;
    const { rpcClient } = useRpcContext();
    const [workspaceName, setWorkspaceName] = React.useState<string>("");
    const [readmeContent, setReadmeContent] = React.useState<string>("");
    const [isCodeGenerating, setIsCodeGenerating] = React.useState<boolean>(false);
    const [projectStructure, setProjectStructure] = React.useState<ProjectStructureResponse>();

    const [responseText, setResponseText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const backendRootUri = useRef("");
    const [enabled, setEnableICP] = useState(false);
    const [devantComponent, setDevantComponent] = useState<DevantComponent | undefined>(undefined);

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
                const workspace = res.workspaces.find(workspace => workspace.fsPath === projectPath);
                if (workspace) {
                    setWorkspaceName(workspace.name);
                }
            });

        rpcClient
            .getBIDiagramRpcClient()
            .handleReadmeContent({ read: true })
            .then((res) => {
                setReadmeContent(res.content);
            });

        rpcClient
            .getICPRpcClient()
            .isIcpEnabled({ projectPath: '' })
            .then((res) => {
                setEnableICP(res.enabled);
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

    useEffect(() => {
        rpcClient.getBIDiagramRpcClient().getDevantComponent()
            .then((res) => {
                console.log(">>> devant component", { res });
                setDevantComponent(res);
            });
    }, []);

    useEffect(() => {
        if (!devantComponent) {
            setDevantComponent(deployedComponent);
        }
    }, [deployedComponent]);

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
                <ProgressRing color={ThemeColors.PRIMARY} />
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

    const handleDeploy = async () => {
        await rpcClient.getBIDiagramRpcClient().deployProject();
    };

    const handleICP = (icpEnabled: boolean) => {
        if (icpEnabled) {
            rpcClient.getICPRpcClient().addICP({ projectPath: '' })
                .then((res) => {
                    setEnableICP(true);
                }
                );
        } else {
            rpcClient.getICPRpcClient().disableICP({ projectPath: '' })
                .then((res) => {
                    setEnableICP(false);
                }
                );
        }
    };

    const handleGenerate = () => {
        rpcClient.getBIDiagramRpcClient().openAIChat({
            scafold: true,
            readme: false,
        });
    };

    const handleEditReadme = () => {
        rpcClient.getBIDiagramRpcClient().openReadme();
    };

    const handleLocalRun = () => {
        rpcClient.getCommonRpcClient().executeCommand({ commands: [BI_COMMANDS.BI_RUN_PROJECT] });
    };

    const handleLocalDebug = () => {
        rpcClient.getCommonRpcClient().executeCommand({ commands: [BI_COMMANDS.BI_DEBUG_PROJECT] });
    };

    const handleDockerBuild = () => {
        rpcClient.getBIDiagramRpcClient().buildProject(BuildMode.DOCKER);
    };

    const handleJarBuild = () => {
        rpcClient.getBIDiagramRpcClient().buildProject(BuildMode.JAR);
    };

    const goToDevant = (devantComponent: DevantComponent) => {
        rpcClient.getCommonRpcClient().openExternalUrl({
            url: `https://console.devant.dev/organizations/${devantComponent.org}`
        });
    };

    return (
        <PageLayout>
            <HeaderRow>
                <TitleContainer>
                    <ProjectTitle>{projectStructure.projectName || workspaceName}</ProjectTitle>
                    <ProjectSubtitle>Integration</ProjectSubtitle>
                </TitleContainer>
                <HeaderControls>
                    <Button appearance="icon" onClick={handleLocalRun} buttonSx={{ padding: "4px 8px" }}>
                        <Codicon name="play" sx={{ marginRight: 5 }} /> Run
                    </Button>
                    <Button appearance="icon" onClick={handleLocalDebug} buttonSx={{ padding: "4px 8px" }}>
                        <Codicon name="debug" sx={{ marginRight: 5 }} /> Debug
                    </Button>
                </HeaderControls>
            </HeaderRow>

            <MainContent>
                <MainPanel noPadding={true}>
                    <DiagramHeaderContainer withPadding={true}>
                        <Title variant="h2">Design</Title>
                        {!isEmptyProject() && (<ActionContainer>
                            <Button appearance="icon" onClick={handleGenerate} buttonSx={{ padding: "2px 8px" }}>
                                <Codicon name="wand" sx={{ marginRight: 8 }} /> Generate
                            </Button>
                            <Button appearance="primary" onClick={handleAddConstruct}>
                                <Codicon name="add" sx={{ marginRight: 8 }} /> Add Artifact
                            </Button>
                        </ActionContainer>)}
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
                                    Start by adding artifacts or use AI to generate your project structure
                                </Typography>
                                <ButtonContainer>
                                    <Button appearance="primary" onClick={handleAddConstruct}>
                                        <Codicon name="add" sx={{ marginRight: 8 }} /> Add Artifact
                                    </Button>
                                    <Button appearance="secondary" onClick={handleGenerate}>
                                        <Codicon name="wand" sx={{ marginRight: 8 }} /> Generate with AI
                                    </Button>
                                </ButtonContainer>
                            </EmptyStateContainer>
                        ) : (
                            <ComponentDiagram projectStructure={projectStructure} />
                        )}
                    </DiagramContent>
                </MainPanel>

                <SidePanel>
                    <DeploymentOptions
                        handleDockerBuild={handleDockerBuild}
                        handleJarBuild={handleJarBuild}
                        handleDeploy={handleDeploy}
                        goToDevant={goToDevant}
                        devantComponent={devantComponent}
                        isDeployed={props.isDeployed}
                    />
                    <Divider sx={{ margin: "16px 0" }} />
                    <IntegrationControlPlane enabled={enabled} handleICP={handleICP} />
                </SidePanel>
            </MainContent>

            <FooterPanel>
                <ReadmeHeaderContainer>
                    <Title variant="h2">README</Title>
                    <Button appearance="icon" onClick={handleEditReadme} buttonSx={{ padding: "4px 8px" }}>
                        <Icon name="bi-edit" sx={{ marginRight: 8, fontSize: 16 }} /> Edit
                    </Button>
                </ReadmeHeaderContainer>
                <ReadmeContent>
                    {readmeContent ? (
                        <ReactMarkdown>{readmeContent}</ReactMarkdown>
                    ) : (
                        <EmptyReadmeContainer>
                            <Description variant="body2">
                                Describe your integration and generate your artifacts with AI
                            </Description>
                            <VSCodeLink onClick={handleEditReadme}>Add a README</VSCodeLink>
                        </EmptyReadmeContainer>
                    )}
                </ReadmeContent>
            </FooterPanel>
        </PageLayout>
    );
}
