/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import { EVENT_TYPE, MACHINE_VIEW, WorkspaceFolder } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { Button, Codicon, TextArea, Card, Typography, LinkButton, Divider } from "@wso2-enterprise/ui-toolkit";
import { Transition } from "@headlessui/react";
import { css } from "@emotion/css";
import styled from "@emotion/styled";
import { View, ViewContent, ViewHeader } from "../../components/View";
import path from "path";

const Container = styled.div({
    display: "flex",
    flexDirection: "column",
    gap: 10,
});

const AddPanel = styled.div({
    position: "relative", // Add this line to position the close button absolutely
    display: "flex",
    flexDirection: "column",
    gap: 10,
    backgroundColor: "var(--vscode-sideBar-background);",
    padding: 20,
});

const PanelViewMore = styled.div({
    display: "flex",
    flexDirection: "column",
    gap: 10,
});

const HorizontalCardContainer = styled.div({
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gridAutoRows: "minmax(80px, auto)",
    gap: "20px",
});

const PanelFooter = styled.div({
    display: "flex",
    justifyContent: "center",
});

// Add this styled component for the close button
const CloseButton = styled(Button)({
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "none", // Optional: Adjust styling as needed
    border: "none", // Optional: Adjust styling as needed
    cursor: "pointer", // Optional: Adjust styling as needed
});

const AIPanel = styled.div({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
});

const transitionEffect = {
    enter: css({
        transition: "opacity 75ms ease-out",
    }),
    enterFrom: css({
        opacity: 0,
    }),
    enterTo: css({
        opacity: 1,
    }),
    leave: css({
        transition: "opacity 150ms ease-in",
    }),
    leaveFrom: css({
        opacity: 1,
    }),
    leaveTo: css({
        opacity: 0,
    }),
};

export function AddArtifactView() {
    const { rpcClient } = useVisualizerContext();
    const [activeWorkspaces, setActiveWorkspaces] = React.useState<WorkspaceFolder>(undefined);
    const [inputAiPrompt, setInputAiPrompt] = React.useState<string>("");
    const [viewMore, setViewMore] = React.useState<boolean>(false);

    const handleClick = async (key: string) => {
        const dir = path.join(activeWorkspaces.fsPath, "src", "main", "wso2mi", "artifacts", key);
        const entry = { info: { path: dir } };
        console.log(entry);
        if (key === "apis") {
            await rpcClient
                .getMiDiagramRpcClient()
                .executeCommand({ commands: ["MI.project-explorer.add-api", entry] });
        } else if (key === "endpoints") {
            await rpcClient
                .getMiDiagramRpcClient()
                .executeCommand({ commands: ["MI.project-explorer.add-endpoint", entry] });
        } else if (key === "sequences") {
            await rpcClient
                .getMiDiagramRpcClient()
                .executeCommand({ commands: ["MI.project-explorer.add-sequence", entry] });
        } else if (key === "inboundEndpoints") {
            await rpcClient
                .getMiDiagramRpcClient()
                .executeCommand({ commands: ["MI.project-explorer.add-inbound-endpoint", entry] });
        } else if (key === "registry") {
            await rpcClient
                .getMiDiagramRpcClient()
                .executeCommand({ commands: ["MI.project-explorer.add-registry-resource", entry] });
        } else if (key === "messageProcessors") {
            await rpcClient
                .getMiDiagramRpcClient()
                .executeCommand({ commands: ["MI.project-explorer.add-message-processor", entry] });
        } else if (key === "proxyServices") {
            await rpcClient
                .getMiDiagramRpcClient()
                .executeCommand({ commands: ["MI.project-explorer.add-proxy-service", entry] });
        } else if (key === "tasks") {
            await rpcClient
                .getMiDiagramRpcClient()
                .executeCommand({ commands: ["MI.project-explorer.add-task", entry] });
        } else if (key === "templates") {
            await rpcClient
                .getMiDiagramRpcClient()
                .executeCommand({ commands: ["MI.project-explorer.add-template", entry] });
        } else if (key === "messageStores") {
            await rpcClient
                .getMiDiagramRpcClient()
                .executeCommand({ commands: ["MI.project-explorer.add-message-store", entry] });
        } else if (key === "localEntries") {
            await rpcClient
                .getMiDiagramRpcClient()
                .executeCommand({ commands: ["MI.project-explorer.add-local-entry", entry] });
        }
    };

    useEffect(() => {
        rpcClient
            .getMiVisualizerRpcClient()
            .getWorkspaces()
            .then((response) => {
                setActiveWorkspaces(response.workspaces[0]);
                console.log(response.workspaces[0]);
            });
    }, []);

    // Add a function to handle the close action
    const handleClose = () => {
        console.log("Close button clicked"); // Implement the close logic here
    };

    const handleGenerateWithAI = async () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } })
        rpcClient.getMiDiagramRpcClient().executeCommand({ commands: ["MI.openAiPanel", inputAiPrompt] });
    };

    const handleAiPromptChange = (value: string) => {
        setInputAiPrompt(value);
    };

    return (
        <View>
            <ViewHeader title={"Project: " + activeWorkspaces?.name} codicon="project"></ViewHeader>
            <ViewContent padding>
                <Container>
                    <AddPanel>
                        <CloseButton onClick={handleClose} appearance="icon" tooltip="Close">
                            <Codicon name="chrome-close" />
                        </CloseButton>
                        <Typography variant="h3" sx={{ margin: "0 0 5px 0", display: "flex", alignItems: "center" }}>
                            <Codicon name="wand" sx={{ marginRight: "5px" }} />
                            Describe your Integration to generate with AI
                        </Typography>
                        <AIPanel>
                            <TextArea
                                onTextChange={handleAiPromptChange}
                                value={inputAiPrompt}
                                rows={4}
                                cols={1000}
                                placeholder="ie. I want to create an API that will route my request based on a header value."
                            ></TextArea>
                            <Button appearance="primary" disabled={inputAiPrompt.length === 0} onClick={handleGenerateWithAI}>
                                <Codicon name="wand" />
                                &nbsp; Generate
                            </Button>
                        </AIPanel>
                    </AddPanel>
                    <AddPanel>
                        <Typography variant="h3" sx={{ margin: 0 }}>
                            Entry Points
                        </Typography>
                        <HorizontalCardContainer>
                            <Card
                                icon="globe"
                                title="API"
                                description="Create an HTTP API with a defined interface."
                                onClick={() => handleClick("apis")}
                            />
                            <Card
                                icon="arrow-swap"
                                title="Proxy"
                                description="Create a proxy service to process and route messages."
                                onClick={() => handleClick("proxyServices")}
                            />
                            <Card
                                icon="tasklist"
                                title="Task"
                                description="Create a task that can be run periodically."
                                onClick={() => handleClick("tasks")}
                            />
                            <Card
                                icon="fold-down"
                                title="Inbound Endpoint"
                                description="Mediate messages sent via events."
                                onClick={() => handleClick("inboundEndpoints")}
                            />
                        </HorizontalCardContainer>
                        <Transition
                            show={viewMore}
                            {...transitionEffect}
                        >
                            <PanelViewMore>
                                <Divider />
                                <Typography variant="h3" sx={{ margin: 0 }}>
                                    Other Artifacts
                                </Typography>
                                <HorizontalCardContainer>
                                    <Card
                                        icon="globe"
                                        title="Endpoint"
                                        description="Create an HTTP API with a defined interface."
                                        onClick={() => handleClick("endpoints")}
                                    />
                                    <Card
                                        icon="globe"
                                        title="Sequence"
                                        description="Create an HTTP API with a defined interface."
                                        onClick={() => handleClick("sequences")}
                                    />
                                    <Card
                                        icon="globe"
                                        title="Registry"
                                        description="Create an HTTP API with a defined interface."
                                        onClick={() => handleClick("registry")}
                                    />
                                    <Card
                                        icon="globe"
                                        title="Message Processor"
                                        description="Create an HTTP API with a defined interface."
                                        onClick={() => handleClick("messageProcessors")}
                                    />
                                    <Card
                                        icon="globe"
                                        title="Template"
                                        description="Create an HTTP API with a defined interface."
                                        onClick={() => handleClick("templates")}
                                    />
                                    <Card
                                        icon="globe"
                                        title="Message Store"
                                        description="Create an HTTP API with a defined interface."
                                        onClick={() => handleClick("messageStores")}
                                    />
                                    <Card
                                        icon="globe"
                                        title="Local Entry"
                                        description="Create an HTTP API with a defined interface."
                                        onClick={() => handleClick("localEntries")}
                                    />
                                </HorizontalCardContainer>
                            </PanelViewMore>
                        </Transition>
                        <PanelFooter>
                            {!viewMore ? (
                                <LinkButton sx={{ padding: "4px 8px" }} onClick={() => setViewMore(true)}>
                                    <Codicon name="plus" />
                                    <Typography variant="body2">View More</Typography>
                                </LinkButton>
                            ) : (
                                <LinkButton sx={{ padding: "4px 8px" }} onClick={() => setViewMore(false)}>
                                    <Typography variant="body2">Show Less</Typography>
                                </LinkButton>
                            )}
                        </PanelFooter>
                    </AddPanel>
                </Container>
            </ViewContent>
        </View>
    );
}
