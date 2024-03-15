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
import { Button, Icon, Codicon, TextArea, VerticleIcons } from "@wso2-enterprise/ui-toolkit";
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


export function Overview() {
    const { rpcClient } = useVisualizerContext();
    const [workspaces, setWorkspaces] = React.useState<WorkspaceFolder[]>([]);
    const [activeWorkspaces, setActiveWorkspaces] = React.useState<WorkspaceFolder>(undefined);
    const [selected, setSelected] = React.useState<string>("");
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
    }, [selected]);

    const changeWorkspace = (fsPath: string) => {
        setSelected(fsPath);
    }

    // Add a function to handle the close action
    const handleClose = () => {
        console.log('Close button clicked'); // Implement the close logic here
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
                            name="play"
                        />
                        &nbsp;Run
                    </Button>
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
                    <Button tooltip="Deploy your integration on the Cloud with Choreo">
                        <Icon
                            name="choreo"
                            sx={{ marginTop: '2px' }}
                        />
                        &nbsp;Deploy in Choreo
                    </Button>
                </ProjectActions>
            </ViewHeader>
            <ViewContent>
                <AddPanel>
                    <CloseButton onClick={handleClose} appearance="icon" tooltip="Close">
                        <Codicon name="chrome-close" />
                    </CloseButton>
                    <h3 style={{ margin: 0 }}>Describe your Integration to get started</h3>
                    <AIPanel>
                        <TextArea value="" rows={4} cols={1000} placeholder="I want to create an API that will route my request based on a header value."></TextArea>
                        <VSCodeButton>
                            <Codicon name="wand" />
                            Generate with AI
                        </VSCodeButton>
                    </AIPanel>
                    <h3>Or, Select an Entry point to Start</h3>
                    <HorizontalCardContainer>
                        <Card icon="globe" title="API" description="Create a new HTTP API" onClick={() => handleClick("apis")} />
                        <Card icon="arrow-swap" title="Proxy" description="Create a new Proxy" onClick={() => handleClick("proxyServices")} />
                        <Card icon="fold-down" title="Task" description="Create a new Task" onClick={() => handleClick("tasks")} />
                        <Card icon="globe" title="Inbound Endpoint" description="Create a new Inbound Endpoint" onClick={() => handleClick("inboundEndpoints")} />
                    </HorizontalCardContainer>
                </AddPanel>

                {projectStructure && <ProjectStructureView projectStructure={projectStructure} workspaceDir={selected} />}
            </ViewContent>
        </View>
    );
}

interface CardProps {
    icon: string;
    title: string;
    description?: string;
    onClick?: () => void;
}

const CardWraper = styled.div({
    border: '1px solid var(--vscode-dropdown-border)',
    backgroundColor: 'var(--vscode-dropdown-background)',
    padding: '10px',
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: 'var(--list-active-selection-background)',
    },
    display: 'flex',
    flexDirection: 'column',
});

const Card: React.FC<CardProps> = ({ icon, title, onClick, description }) => {
    return (
        <CardWraper onClick={onClick}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <div style={{ width: '1.5em', height: '1.5em', marginRight: "10px" }}>
                        <Codicon name={icon} iconSx={{ fontSize: '1.5em' }} />
                    </div>
                    <div style={{ fontSize: '1.2em' }}>{title}</div>
                </div>
                {description && <div style={{ marginLeft: '2.3em' }}>{description}</div>}
            </div>
        </CardWraper>
    );
};
