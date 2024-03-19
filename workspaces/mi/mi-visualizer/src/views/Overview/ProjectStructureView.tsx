/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ProjectStructureEntry, ProjectStructureResponse, ProjectDirectoryMap, EsbDirectoryMap, EVENT_TYPE, MACHINE_VIEW } from '@wso2-enterprise/mi-core';
import { Codicon, ComponentCard } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import path from 'path';
import { VSCodeButton, VSCodeDataGrid, VSCodeDataGridRow, VSCodeDataGridCell } from "@vscode/webview-ui-toolkit/react";


interface ArtifactType {
    title: string;
    command: string;
    view: MACHINE_VIEW;
    icon: string;
    description: (entry: any) => string;
    path: (entry: any) => string;
}

const artifactTypeMap: Record<string, ArtifactType> = {
    apis: {
        title: "APIs",
        command: "MI.project-explorer.add-api",
        view: MACHINE_VIEW.ServiceDesigner,
        icon: "globe",
        description: (entry: any) => `API Context: ${entry.context}`,
        path: (entry: any) => entry.path,
    },
    endpoints: {
        title: "Endpoints",
        command: "MI.project-explorer.add-endpoint",
        view: MACHINE_VIEW.EndPointForm,
        icon: "plug",
        description: (entry: any) => `Endpoint SubType: ${entry.subType}`,
        path: (entry: any) => entry.path,
    },
    sequences: {
        title: "Sequences",
        command: "MI.project-explorer.add-sequence",
        view: MACHINE_VIEW.SequenceView,
        icon: "list-tree",
        description: (entry: any) => `Reusable sequence`,
        path: (entry: any) => entry.path,
    },
    proxyServices: {
        title: "Proxy Services",
        command: "MI.project-explorer.add-proxy-service",
        view: MACHINE_VIEW.ProxyView,
        icon: "server",
        description: (entry: any) => "Proxy Service",
        path: (entry: any) => entry.path,
    },
    inboundEndpoints: {
        title: "Inbound Endpoints",
        command: "MI.project-explorer.add-inbound-endpoint",
        view: MACHINE_VIEW.InboundEPForm,
        icon: "sign-in",
        description: (entry: any) => "Inbound Endpoint",
        path: (entry: any) => entry.path,
    },
    messageStores: {
        title: "Message Stores",
        command: "MI.project-explorer.add-message-store",
        view: MACHINE_VIEW.MessageStoreForm,
        icon: "database",
        description: (entry: any) => "Message Store",
        path: (entry: any) => entry.path,
    },
    messageProcessors: {
        title: "Message Processors",
        command: "MI.project-explorer.add-message-processor",
        view: MACHINE_VIEW.MessageProcessorForm,
        icon: "cog",
        description: (entry: any) => "Message Processor",
        path: (entry: any) => entry.path,
    },
    tasks: {
        title: "Tasks",
        command: "MI.project-explorer.add-task",
        view: MACHINE_VIEW.TaskForm,
        icon: "checklist",
        description: (entry: any) => "Task",
        path: (entry: any) => entry.path,
    },
    localEntries: {
        title: "Local Entries",
        command: "MI.project-explorer.add-local-entry",
        view: MACHINE_VIEW.LocalEntryForm,
        icon: "note",
        description: (entry: any) => "Local Entry",
        path: (entry: any) => entry.path,
    },
    templates: {
        title: "Templates",
        command: "MI.project-explorer.add-template",
        view: MACHINE_VIEW.TemplateForm,
        icon: "file-code",
        description: (entry: any) => "Template",
        path: (entry: any) => entry.path,
    },
    // Add more artifact types as needed
};





const Listing = styled.div({
    marginTop: "2em"
})

const ProjectStructureView = (props: { projectStructure: any, workspaceDir: string }) => {
    const { projectStructure } = props;
    const { rpcClient } = useVisualizerContext();

    const handleClick = (documentUri: string, view: MACHINE_VIEW) => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view, documentUri } });
    };

    const handlePlusClick = async (key: string, command: string) => {
        const dir = path.join(props.workspaceDir, 'src', 'main', 'wso2mi', 'artifacts', key);
        const entry = { info: { path: dir } };
        await rpcClient.getMiDiagramRpcClient().executeCommand({ commands: [command, entry] });
    };

    const ifHasEntries = () => {
        const artifacts = projectStructure.directoryMap.src.main.wso2mi.artifacts;
        if (artifacts) {
            return Object.values(artifacts)
                .filter(artifactArray => Array.isArray(artifactArray) && artifactArray.length > 0)
                .length > 0;
        }
        return false;
    }


    return (
        <Listing>
            {/* If has entries render content*/}
            {ifHasEntries() &&
                <>
                    {Object.entries(projectStructure.directoryMap.src.main.wso2mi.artifacts)
                        .filter(([key, value]) => artifactTypeMap.hasOwnProperty(key) && Array.isArray(value) && value.length > 0)
                        .map(([key, value]) => (
                            <div style={{ marginBottom: '2em' }}>
                                <h3>{artifactTypeMap[key].title}</h3>
                                {Object.entries(value).map(([_, entry]) => (
                                    <Entry
                                        key={entry.name}
                                        icon={artifactTypeMap[key].icon}
                                        name={entry.name}
                                        description={artifactTypeMap[key].description(entry)}
                                        onClick={() => { handleClick(artifactTypeMap[key].path(entry), artifactTypeMap[key].view) }}
                                    />
                                ))}
                            </div>
                        ))
                    }
                </>
            }
            {/* else render message */}
            {!ifHasEntries() && <div> No entries found </div>}
        </Listing>
    );
};

interface EntryProps {
    icon: string; // Changed to string to use codicon names
    name: string;
    description: string;
    onClick: () => void; // Added onClick callback prop
}

const EntryContainer = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    cursor: pointer;
    padding: 10px;
    background-color: var(--vscode-editorHoverWidget-background);
    &:hover {
        background-color: var(--vscode-list-hoverBackground);
    }
`;

const Entry: React.FC<EntryProps> = ({ icon, name, description, onClick }) => {
    return (
        <EntryContainer onClick={onClick}>
            <div style={{ width: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '10px' }}>
                <Codicon name={icon} />
            </div>
            <div style={{ flex: 2, fontWeight: 'bold' }}>
                {name}
            </div>
            <div style={{ flex: 9 }}>
                {description}
            </div>
            <div style={{ marginLeft: 'auto' }}>
                <Codicon name="more" />
            </div>
        </EntryContainer>
    );
};


export default ProjectStructureView;
