/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { EVENT_TYPE, ProjectStructureResponse, MACHINE_VIEW, DIRECTORY_MAP, SHARED_COMMANDS, ProjectStructureArtifactResponse } from '@wso2-enterprise/ballerina-core';
import { ContextMenu, Icon } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { useVisualizerContext } from '@wso2-enterprise/ballerina-rpc-client';
import { Fragment, useEffect, useState } from 'react';
import React from 'react';

interface ArtifactType {
    title: string;
    command: string;
    view: MACHINE_VIEW;
    icon: string;
    iconSx?: any;
    isCodicon?: boolean;
    description: (entry: any) => string;
    path: (entry: any) => any;
    isMainSequence?: boolean;
}

const artifactTypeMap: Record<string, ArtifactType> = {
    [DIRECTORY_MAP.SERVICES]: {
        title: "Services",
        command: SHARED_COMMANDS.OPEN_SERVICE_FORM,
        view: MACHINE_VIEW.ServiceDesigner,
        icon: "APIResource",
        description: (description: string) => `API Context: ${description}`,
        path: (entry: any) => entry,
    },
    [DIRECTORY_MAP.TASKS]: {
        title: "Tasks",
        command: SHARED_COMMANDS.OPEN_SERVICE_FORM,
        view: MACHINE_VIEW.ServiceDesigner,
        icon: "endpoint",
        description: (entry: any) => `Type: ${entry.subType}`,
        path: (entry: any) => entry,
    },
    [DIRECTORY_MAP.TRIGGERS]: {
        title: "Triggers",
        command: SHARED_COMMANDS.OPEN_SERVICE_FORM,
        view: MACHINE_VIEW.ServiceDesigner,
        icon: "Sequence",
        description: (entry: any) => `Reusable sequence`,
        path: (entry: any) => entry,
    },
    [DIRECTORY_MAP.CONNECTIONS]: {
        title: "Connections",
        command: SHARED_COMMANDS.OPEN_SERVICE_FORM,
        view: MACHINE_VIEW.ServiceDesigner,
        isCodicon: true,
        icon: "arrow-swap",
        description: (entry: any) => "Proxy Service",
        path: (entry: any) => entry,
    },
    [DIRECTORY_MAP.SCHEMAS]: {
        title: "Schemas",
        command: SHARED_COMMANDS.OPEN_SERVICE_FORM,
        view: MACHINE_VIEW.ServiceDesigner,
        icon: "inbound-endpoint",
        description: (entry: any) => "Inbound Endpoint",
        path: (entry: any) => entry,
    },
    [DIRECTORY_MAP.CONFIGURATIONS]: {
        title: "Configurations",
        command: SHARED_COMMANDS.OPEN_SERVICE_FORM,
        view: MACHINE_VIEW.ServiceDesigner,
        icon: "message-store",
        description: (entry: any) => "Message Store",
        path: (entry: any) => entry,
    },
    // Add more artifact types as needed
};

const ProjectStructureView = (props: { projectStructure: ProjectStructureResponse }) => {
    const { projectStructure } = props;
    const { rpcClient } = useVisualizerContext();

    const goToView = async (res: ProjectStructureArtifactResponse) => {
        rpcClient.getVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { documentUri: res.path, position: res.position } });
    };

    const goToSource = (filePath: string) => {
        // rpcClient.getMiVisualizerRpcClient().goToSource({ filePath });
    }

    const deleteArtifact = (path: string) => {
        // rpcClient.getMiDiagramRpcClient().deleteArtifact({ path, enableUndo: true });
    }

    const markAsDefaultSequence = (path: string, remove: boolean) => {
        // rpcClient.getMiDiagramRpcClient().markAsDefaultSequence({ path, remove });
    }

    const ifHasEntries = () => {
        const artifacts = projectStructure.directoryMap;
        if (artifacts) {
            return Object.values(artifacts)
                .filter(artifactArray => Array.isArray(artifactArray) && artifactArray.length > 0)
                .length > 0;
        }
        return false;
    }

    function checkHasConnections(value: any) {
        return value.some((entry: any) => {
            for (let key in entry) {
                if (Array.isArray(entry[key])) {
                    return entry[key].some((innerItem: any) => innerItem.connectorName !== undefined);
                }
            }
            return false;
        });
    }

    return (
        <Fragment>
            {ifHasEntries() &&
                <>
                    {Object.entries(projectStructure.directoryMap)
                        .filter(([key, value]) => artifactTypeMap.hasOwnProperty(key) && Array.isArray(value) && value.length > 0)
                        .map(([key, value]) => {
                            const hasOnlyUndefinedItems = Object.values(value).every(entry => entry.path === undefined);
                            const hasConnections = hasOnlyUndefinedItems ? checkHasConnections(value) : false;
                            return (!hasOnlyUndefinedItems || hasConnections) && (
                                <div>
                                    <h3>{artifactTypeMap[key].title}</h3>
                                    {Object.entries(value).map(([_, entry]) => (
                                        entry.path && (
                                            <Entry
                                                key={entry.name}
                                                isCodicon={artifactTypeMap[key].isCodicon}
                                                icon={null}
                                                iconSx={artifactTypeMap[key].iconSx}
                                                name={entry.name}
                                                description={artifactTypeMap[key].description(entry.context)}
                                                onClick={() => goToView(entry)}
                                                goToView={() => goToView(entry)}
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
        </Fragment>
    );
};

interface EntryProps {
    icon: string; // Changed to string to use codicon names
    iconSx?: any;
    isCodicon?: boolean;
    name: string;
    description: string;
    // Context menu action callbacks
    onClick: () => void;
    goToView: () => void;
    goToSource: () => void;
    deleteArtifact: () => void;
    isMainSequence?: boolean;
    markAsDefaultSequence?: () => void;
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

const Entry: React.FC<EntryProps> = ({ icon, name, description, onClick, goToView, goToSource, deleteArtifact, isMainSequence, markAsDefaultSequence, iconSx, isCodicon }) => {
    const [showFallbackIcon, setShowFallbackIcon] = useState(false);

    const onError = () => {
        setShowFallbackIcon(true);
    }

    return (
        <EntryContainer onClick={onClick}>
            {description === "Connection" ? (
                <div style={{ width: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '10px' }}>
                    {!showFallbackIcon && icon ? (
                        <img src={icon} alt="Icon" onError={onError} />
                    ) : (
                        // Fallback icon on offline mode
                        <Icon name="connector" sx={{ color: "#D32F2F" }} />
                    )}
                </div>
            ) : (
                <div style={{ width: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '10px' }}>
                    <Icon name={icon} iconSx={iconSx} isCodicon={isCodicon} />
                </div>
            )}
            <div style={{ flex: 2, fontWeight: 'bold' }}>
                {name}
            </div>
            <div style={{ flex: 9, display: 'flex' }}>
                <div style={{ flex: 6 }}>{description}</div>
                {isMainSequence && <div style={{ flex: 2 }}>
                    <div style={{
                        backgroundColor: 'var(--button-secondary-background)',
                        color: 'white',
                        padding: 'var(--button-padding-vertical) var(--button-padding-horizontal)',
                        width: 'fit-content',
                        borderRadius: '10px'
                    }}>Automation Sequence</div>
                </div>}
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
                        ...(markAsDefaultSequence ? [{
                            id: "markAsAutomationModeDefaultSequence",
                            label: `${isMainSequence ? "Remove" : "Set"} as automation sequence`,
                            onClick: markAsDefaultSequence,
                        }] : []),
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
