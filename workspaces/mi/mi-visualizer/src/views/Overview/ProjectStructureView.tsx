/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { EVENT_TYPE, MACHINE_VIEW } from '@wso2-enterprise/mi-core';
import { Alert, Codicon, ContextMenu } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { Fragment } from 'react';

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
        description: (entry: any) => `Type: ${entry.subType}`,
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
        icon: "gear",
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
        description: (entry: any) => `Type: ${entry.subType}`,
        path: (entry: any) => entry.path,
    },
    // TODO: Will introduce back when both datasource and dataservice functionalities are completely supported
    // dataServices: {
    //     title: "Data Services",
    //     command: "MI.project-explorer.open-dss-service-designer",
    //     view: MACHINE_VIEW.DSSServiceDesigner,
    //     icon: "file-code",
    //     description: (entry: any) => "Data Service",
    //     path: (entry: any) => entry.path,
    // },
    // dataSources: {
    //     title: "Data Sources",
    //     command: "MI.project-explorer.add-data-source",
    //     view: MACHINE_VIEW.DataSourceForm,
    //     icon: "file-code",
    //     description: (entry: any) => "Data Source",
    //     path: (entry: any) => entry.path,
    // }
    // Add more artifact types as needed
};

const ProjectStructureView = (props: { projectStructure: any, workspaceDir: string }) => {
    const { projectStructure } = props;
    const { rpcClient } = useVisualizerContext();

    const goToView = async (documentUri: string, view: MACHINE_VIEW) => {
        const type = view === MACHINE_VIEW.EndPointForm ? 'endpoint' : 'template';
        if (view === MACHINE_VIEW.EndPointForm || view === MACHINE_VIEW.TemplateForm) {
            view = await getView(documentUri);
        }
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view, documentUri, customProps: { type: type } } });
    };

    const goToSource = (filePath: string) => {
        rpcClient.getMiVisualizerRpcClient().goToSource({ filePath });
    }

    const deleteArtifact = (path: string) => {
        rpcClient.getMiDiagramRpcClient().deleteArtifact({ path, enableUndo: true });
    }

    const ifHasEntries = () => {
        const artifacts = projectStructure.directoryMap.src.main.wso2mi.artifacts;
        if (artifacts) {
            return Object.values(artifacts)
                .filter(artifactArray => Array.isArray(artifactArray) && artifactArray.length > 0)
                .length > 0;
        }
        return false;
    }

    const getView = async (documentUri: string) => {
        const syntaxTree = await rpcClient.getMiDiagramRpcClient().getSyntaxTree({ documentUri: documentUri });
        let view = MACHINE_VIEW.TemplateForm;
        if (!(syntaxTree.syntaxTree.template != undefined && syntaxTree.syntaxTree.template.sequence != undefined)) {
            const endpointType = syntaxTree.syntaxTree.template?.endpoint.type ?? syntaxTree.syntaxTree.endpoint.type;
            if (endpointType === 'HTTP_ENDPOINT') {
                view = MACHINE_VIEW.HttpEndpointForm;
            } else if (endpointType === 'ADDRESS_ENDPOINT') {
                view = MACHINE_VIEW.AddressEndpointForm;
            } else if (endpointType === 'WSDL_ENDPOINT') {
                view = MACHINE_VIEW.WsdlEndpointForm;
            } else if (endpointType === 'DEFAULT_ENDPOINT') {
                view = MACHINE_VIEW.DefaultEndpointForm;
            } else if (endpointType === 'LOAD_BALANCE_ENDPOINT') {
                view = MACHINE_VIEW.LoadBalanceEndPointForm;
            } else if (endpointType === 'FAIL_OVER_ENDPOINT') {
                view = MACHINE_VIEW.FailoverEndPointForm;
            } else if (endpointType === 'RECIPIENT_LIST_ENDPOINT') {
                view = MACHINE_VIEW.RecipientEndPointForm;
            } else if (endpointType === 'TEMPLATE_ENDPOINT') {
                view = MACHINE_VIEW.TemplateEndPointForm;
            }
        } else if (syntaxTree.syntaxTree.template.sequence != undefined) {
            view = MACHINE_VIEW.SequenceTemplateView;
        }
        return view;
    }

    return (
        <Fragment>
            {/* If has entries render content*/}
            {ifHasEntries() &&
                <>
                    {Object.entries(projectStructure.directoryMap.src.main.wso2mi.artifacts)
                        .filter(([key, value]) => artifactTypeMap.hasOwnProperty(key) && Array.isArray(value) && value.length > 0)
                        .map(([key, value]) => {
                            const hasOnlyUndefinedItems = Object.values(value).every(entry => entry.path === undefined);
                            return !hasOnlyUndefinedItems && (
                                <div>
                                    <h3>{artifactTypeMap[key].title}</h3>
                                    {Object.entries(value).map(([_, entry]) => (
                                        entry.path && (
                                            <Entry
                                                key={entry.name}
                                                icon={artifactTypeMap[key].icon}
                                                name={entry.name}
                                                description={artifactTypeMap[key].description(entry)}
                                                onClick={() => goToView(artifactTypeMap[key].path(entry), artifactTypeMap[key].view)}
                                                goToView={() => goToView(artifactTypeMap[key].path(entry), artifactTypeMap[key].view)}
                                                goToSource={() => goToSource(artifactTypeMap[key].path(entry))}
                                                deleteArtifact={() => deleteArtifact(artifactTypeMap[key].path(entry))}
                                            />
                                        )
                                    ))}
                                </div>
                            );
                        })
                    }
                </>
            }
            {/* else render message */}
            {!ifHasEntries() && (
                <Alert
                    title="No artifacts were found"
                    subTitle="Add artifacts to your project to see them here"
                    variant="primary"
                />
            )}
        </Fragment>
    );
};

interface EntryProps {
    icon: string; // Changed to string to use codicon names
    name: string;
    description: string;
    // Context menu action callbacks
    onClick: () => void;
    goToView: () => void;
    goToSource: () => void;
    deleteArtifact: () => void;
}

const EntryContainer = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    padding: 10px;
    cursor: pointer;
    background-color: var(--vscode-editorHoverWidget-background);
    &:hover {
        background-color: var(--vscode-list-hoverBackground);
    }
`;

const Entry: React.FC<EntryProps> = ({ icon, name, description, onClick, goToView, goToSource, deleteArtifact }) => {
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
                <ContextMenu
                    menuSx={{ transform: "translateX(-50%)" }}
                    menuItems={[
                        {
                            id: "goToView",
                            label: "View",
                            onClick: goToView,
                        },
                        {
                            id: "goToSource",
                            label: "Go to Source",
                            onClick: goToSource,
                        },
                        {
                            id: "deleteArtifact",
                            label: "Delete",
                            onClick: deleteArtifact
                        }
                    ]}
                />
            </div>
        </EntryContainer>
    );
};


export default ProjectStructureView;
