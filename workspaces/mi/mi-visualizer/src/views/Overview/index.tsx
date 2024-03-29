/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import { MachineStateValue, ProjectStructureResponse, WorkspaceFolder, EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import ProjectStructureView from "./ProjectStructureView";
import { Button, Icon, Codicon, TextArea, Card } from "@wso2-enterprise/ui-toolkit";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import { View, ViewContent, ViewHeader } from "../../components/View";
import path from 'path';


const AddPanel = styled.div({
    position: 'relative', // Add this line to position the close button absolutely

    backgroundColor: 'var(--vscode-sideBar-background);',
    padding: 20
});

const ProjectActions = styled.div({
    display: 'flex',
    alignItems: 'center',
    gap: '5px'

});

const HorizontalCardContainer = styled.div({
    marginTop: 10,
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
});



// Add this styled component for the close button
const CloseButton = styled(Button)({
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'none', // Optional: Adjust styling as needed
    border: 'none', // Optional: Adjust styling as needed
    cursor: 'pointer', // Optional: Adjust styling as needed
});

const AIPanel = styled.div({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
});

interface OverviewProps {
    stateUpdated: boolean;
}

export function Overview(props: OverviewProps) {
    const { rpcClient } = useVisualizerContext();
    const [workspaces, setWorkspaces] = React.useState<WorkspaceFolder[]>([]);
    const [activeWorkspaces, setActiveWorkspaces] = React.useState<WorkspaceFolder>(undefined);
    const [selected, setSelected] = React.useState<string>("");
    const [inputAiPrompt, setInputAiPrompt] = React.useState<string>("");
    const [projectStructure, setProjectStructure] = React.useState<ProjectStructureResponse>(undefined);

    const handleClick = async (key: string) => {
        const dir = path.join(activeWorkspaces.fsPath, 'src', 'main', 'wso2mi', 'artifacts', key);
        const entry = { info: { path: dir } };
        console.log(entry);
        if (key === 'apis') {
            await rpcClient.getMiDiagramRpcClient().executeCommand({ commands: ["MI.project-explorer.add-api", entry] });
        } else if (key === 'endpoints') {
            await rpcClient.getMiDiagramRpcClient().executeCommand({ commands: ["MI.project-explorer.add-endpoint", entry] });
        } else if (key === 'sequences') {
            await rpcClient.getMiDiagramRpcClient().executeCommand({ commands: ["MI.project-explorer.add-sequence", entry] });
        } else if (key === 'inboundEndpoints') {
            await rpcClient.getMiDiagramRpcClient().executeCommand({ commands: ["MI.project-explorer.add-inbound-endpoint", entry] });
        } else if (key === 'registry') {
            await rpcClient.getMiDiagramRpcClient().executeCommand({ commands: ["MI.project-explorer.add-registry-resource", entry] });
        } else if (key === 'messageProcessors') {
            await rpcClient.getMiDiagramRpcClient().executeCommand({ commands: ["MI.project-explorer.add-message-processor", entry] });
        } else if (key === 'proxyServices') {
            await rpcClient.getMiDiagramRpcClient().executeCommand({ commands: ["MI.project-explorer.add-proxy-service", entry] });
        } else if (key === 'tasks') {
            await rpcClient.getMiDiagramRpcClient().executeCommand({ commands: ["MI.project-explorer.add-task", entry] });
        } else if (key === 'templates') {
            await rpcClient.getMiDiagramRpcClient().executeCommand({ commands: ["MI.project-explorer.add-template", entry] });
        } else if (key === 'messageStores') {
            await rpcClient.getMiDiagramRpcClient().executeCommand({ commands: ["MI.project-explorer.add-message-store", entry] });
        } else if (key === 'localEntries') {
            await rpcClient.getMiDiagramRpcClient().executeCommand({ commands: ["MI.project-explorer.add-local-entry", entry] });
        }
    };

    useEffect(() => {
        rpcClient.getMiVisualizerRpcClient().getWorkspaces().then((response) => {
            setWorkspaces(response.workspaces);
            setActiveWorkspaces(response.workspaces[0]);
            changeWorkspace(response.workspaces[0].fsPath);
            console.log(response.workspaces[0]);
        });
    }, []);

    useEffect(() => {
        if (workspaces && selected) {
            rpcClient.getMiVisualizerRpcClient().getProjectStructure({ documentUri: selected }).then((response) => {
                console.log(response);
                setProjectStructure(response);
            });
        }
    }, [selected, props]);

    const changeWorkspace = (fsPath: string) => {
        setSelected(fsPath);
    }

    // Add a function to handle the close action
    const handleClose = () => {
        console.log('Close button clicked'); // Implement the close logic here
    }

    const handleGenerateWithAI = () => {
        rpcClient.getMiDiagramRpcClient().executeCommand({ commands: ["MI.openAiPanel", inputAiPrompt] });
    }

    const handleAiPromptChange = (value: string) => {
        setInputAiPrompt(value);
    }


    return (
        <View>
            <ViewHeader title={"Project: " + activeWorkspaces?.name} codicon="project">
                <ProjectActions>
                    <Button
                        appearance="icon"
                        onClick={() => { }}
                        tooltip="Icon Button"
                    >
                        <Codicon
                            name="combine"
                        />
                        &nbsp;&nbsp;Build

                    </Button>
                    <Button
                        appearance="icon"
                        tooltip="Deploy your integration on the Cloud with Choreo">
                        <Icon
                            name="choreo"
                            sx={{ marginTop: '2px', color: '#5567d5' }}
                        />
                        &nbsp;Deploy in Choreo
                    </Button>
                </ProjectActions>
            </ViewHeader>
            <ViewContent padding>
                <AddPanel>
                    <CloseButton onClick={handleClose} appearance="icon" tooltip="Close">
                        <Codicon name="chrome-close" />
                    </CloseButton>
                    <h3 style={{ margin: '0 0 5px 0', display: 'flex', alignItems: 'center' }}>
                        <Codicon name="wand" sx={{ marginRight: '5px' }} /> Describe your Integration to generate with AI
                    </h3>
                    <AIPanel>
                        <TextArea onTextChange={handleAiPromptChange} value={inputAiPrompt} rows={4} cols={1000} placeholder="ie. I want to create an API that will route my request based on a header value."></TextArea>
                        <VSCodeButton onClick={handleGenerateWithAI}>
                            <Codicon name="wand" />
                            &nbsp; Generate
                        </VSCodeButton>
                    </AIPanel>
                    <h3>Or, Select an Entry point to Start</h3>
                    <HorizontalCardContainer>
                        <Card icon="globe" title="API" description="Create an HTTP API with a defined interface." onClick={() => handleClick("apis")} />
                        <Card icon="arrow-swap" title="Proxy" description="Create a proxy service to process and route messages." onClick={() => handleClick("proxyServices")} />
                        <Card icon="tasklist" title="Task" description="Create a task that can be run periodically." onClick={() => handleClick("tasks")} />
                        <Card icon="fold-down" title="Inbound Endpoint" description="Mediate messages sent via events." onClick={() => handleClick("inboundEndpoints")} />
                    </HorizontalCardContainer>
                </AddPanel>

                {projectStructure && <ProjectStructureView projectStructure={projectStructure} workspaceDir={selected} />}
            </ViewContent>
        </View>
    );
}
