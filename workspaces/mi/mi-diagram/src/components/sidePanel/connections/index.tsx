/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Codicon, ComponentCard, IconLabel, AutoComplete, LinkButton, Icon } from "@wso2-enterprise/ui-toolkit";
import React, { useContext, useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import SidePanelContext from "../SidePanelContexProvider";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { sidepanelAddPage } from "..";
import { FirstCharToUpperCase } from "../../../utils/commons";
import AddConnector from "../Pages/AddConnector";
import { MACHINE_VIEW, POPUP_EVENT_TYPE, ParentPopupData } from "@wso2-enterprise/mi-core";
import CallForm from "../Pages/mediators/core/call";

const VersionTag = styled.div`
    color: #808080;
    font-size: 10px;
    padding-left: 2px;
`;

const CardContent = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 100%;
`;

const CardLabel = styled.div`
    display: flex;
    flex-direction: row;
    align-self: flex-start;
    width: 100%;
    gap: 10px;
`;

const MessageWrapper = styled.div`
    display: flex;
    align-items: center;
    padding: 10px 0;
`;

const OldProjectMessage = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding-top: 20px;
    gap: 10px;
`;

const ConnectionWrapper = styled.div`
    padding: 0px;
    display: flex;
    flex-direction: column;
`;

const IconContainer = styled.div`
    width: 35px;

    & img {
        width: 35px;
    }
`;

const SmallIconContainer = styled.div`
    width: 25px;

    & img {
        width: 25px;
    }
`;

const SectionTitleWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const SectionContainer = styled.div`
    width: 390px;
`;

const OperationGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px 5px;
    padding-top: 10px;
`;

const ExternalsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

interface Connection {
    name: string;
    connectionType: string;
    path: string;
}

interface ConnectionsData {
    [key: string]: { connections: Connection[], connectorData: any, iconPathUri: string };
}

export interface ConnectorPageProps {
    documentUri: string;
    searchValue?: string;
    clearSearch?: () => void;
    nodePosition: any;
    trailingSpace: string;
}

export function ConnectionPage(props: ConnectorPageProps) {
    const sidePanelContext = useContext(SidePanelContext);
    const { rpcClient } = useVisualizerContext();
    const [expandedConnections, setExpandedConnections] = useState<any[]>([]);
    const [connections, setConnections] = useState<ConnectionsData>(undefined);
    const [endpoints, setEndpoints] = useState<any[]>(undefined);
    const [filteredConnections, setFilteredConnections] = useState<ConnectionsData>(undefined);
    const [filteredOperations, setFilteredOperations] = useState<any[][]>([]);
    const [filteredEndpoints, setFilteredEndpoints] = useState<any[]>([]);
    const [isOldProject, setIsOldProject] = useState(false);
    const [debouncedValue, setDebouncedValue] = useState(props.searchValue);

    const fetchConnections = async () => {
        const connectionData: any = await rpcClient.getMiDiagramRpcClient().getConnectorConnections({
            documentUri: props.documentUri,
            connectorName: null
        });

        const connectorData = await rpcClient.getMiDiagramRpcClient().getAvailableConnectors({
            documentUri: props.documentUri,
            connectorName: ""
        });

        if (connectionData) {

            const newConnectionInfo: ConnectionsData = Object.fromEntries(await Promise.all(
                Object.keys(connectionData).map(async (key) => {
                    const connections = connectionData[key].connections;
                    const connector = connectorData.connectors.find((connector: any) => connector.name === key);
                    const iconPath = await rpcClient.getMiDiagramRpcClient().getIconPathUri({ path: connector.iconPath, name: "icon-small" });
                    return [key, { connections, connectorData: connector, iconPathUri: iconPath.uri }];
                })
            ));

            setConnections(newConnectionInfo);
            return (newConnectionInfo);
        }
    };

    const fetchEndpoints = async () => {
        const result = await rpcClient.getMiDiagramRpcClient().getAvailableResources({
            documentIdentifier: props.documentUri,
            resourceType: "endpoint"
        });

        setEndpoints(result.resources);
    }

    useEffect(() => {
        checkOldProject();
        fetchConnections();
        fetchEndpoints();
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(props.searchValue);
        }, 400);

        return () => {
            clearTimeout(handler);
        };
    }, [props.searchValue]);

    const checkOldProject = async () => {
        const oldProjectResponse = await rpcClient.getMiDiagramRpcClient().checkOldProject();
        setIsOldProject(oldProjectResponse);
    };

    const searchConnections = () => {
        if (connections) {
            const searchResults: ConnectionsData = {};

            Object.keys(connections).forEach((key) => {
                const matchingConnections = connections[key].connections?.filter((connection) => {
                    // Connection Name match
                    const nameMatch = connection.name.toLowerCase().includes(debouncedValue.toLowerCase());

                    // Operation matches
                    const operations = connections[key].connectorData?.actions || [];
                    const operationMatch = operations.some((operation: any) => {
                        const operationNameMatch = operation.name.toLowerCase().includes(debouncedValue.toLowerCase());
                        if (operationNameMatch) {
                            const allowedTypes = operation.allowedConnectionTypes;
                            return allowedTypes?.includes(connection.connectionType);
                        }
                        return false;
                    });

                    return nameMatch || operationMatch;
                });

                if (matchingConnections.length > 0) {
                    if (!searchResults[key]) {
                        searchResults[key] = {
                            ...connections[key],
                            connections: []
                        };
                    }
                    searchResults[key].connections.push(...matchingConnections);
                }
            });

            return searchResults;
        }
    }

    const searchOperations = () => {
        if (connections) {
            const searchResults: any[][] = [];

            Object.keys(connections).forEach((key) => {
                connections[key].connections?.forEach((connection) => {
                    const nameMatch = connection.name.toLowerCase().includes(debouncedValue.toLowerCase());

                    if (!nameMatch) {
                        const matchingActions: any[] = [];
                        const operations = connections[key].connectorData?.actions || [];
                        operations.forEach((operation: any) => {
                            const operationNameMatch = operation.name.toLowerCase().includes(debouncedValue.toLowerCase());
                            if (operationNameMatch) {
                                matchingActions.push(operation);
                            }
                        });

                        if (matchingActions.length > 0) {
                            searchResults.push([connection, matchingActions]);
                        }
                    }
                });
            });

            return searchResults;
        }
    }

    const searchEndpoints = () => {
        if (endpoints) {
            const searchResults = endpoints.filter((endpoint) => {
                return endpoint.name.toLowerCase().includes(debouncedValue.toLowerCase());
            });

            return searchResults;
        }

        return [];
    };

    useEffect(() => {
        let connectionsFiltered = connections;
        let endpointsFiltered = endpoints;
        let operationsFiltered = [];

        if (debouncedValue) {
            setExpandedConnections([]);
            connectionsFiltered = searchConnections();
            operationsFiltered = searchOperations();
            endpointsFiltered = searchEndpoints();

            setFilteredOperations(operationsFiltered);
        } else {
            setFilteredOperations([]);
        }

        setFilteredConnections(connectionsFiltered);
        setFilteredEndpoints(endpointsFiltered);
    }, [debouncedValue, connections, endpoints]);

    const reloadConnectionList = async () => {
        fetchConnections();
    }

    const selectConnection = async (connectorName: string, connection: Connection) => {
        if (expandedConnections.includes(connection)) {
            setExpandedConnections(expandedConnections.filter(item => item !== connection));
        } else {
            setExpandedConnections([...expandedConnections, connection]);
        }
    }

    const addNewConnection = async () => {
        rpcClient.getMiVisualizerRpcClient().openView({
            type: POPUP_EVENT_TYPE.OPEN_VIEW,
            location: {
                documentUri: props.documentUri,
                view: MACHINE_VIEW.ConnectorStore
            },
            isPopup: true
        });

        rpcClient.onParentPopupSubmitted(async (data: ParentPopupData) => {
            if (data.recentIdentifier) {
                const newConnections = await fetchConnections();
                const newConnection = getConnectionByName(data.recentIdentifier, newConnections);
                setExpandedConnections([newConnection]);
            }
        });
    }

    const addNewEndpoint = async () => {
        rpcClient.getMiVisualizerRpcClient().openView({
            type: POPUP_EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.EndPointForm
            },
            isPopup: true
        });

        rpcClient.onParentPopupSubmitted((data: ParentPopupData) => {
            if (data.recentIdentifier) {
                fetchEndpoints();
            }
        });
    }

    function getConnectionByName(connectionName: string, connections: ConnectionsData): Connection | undefined {
        for (const key in connections) {
            const foundConnection = (connections[key].connections).find(connection => connection.name === connectionName);
            if (foundConnection) {
                return foundConnection;
            }
        }
        return undefined;
    }

    const generateForm = async (connection: Connection, operation: string, connectorData: any) => {

        const uiSchemaPath = connectorData?.uiSchemaPath;

        // Retrieve form
        const formJSON = await rpcClient.getMiDiagramRpcClient().getConnectorForm({ uiSchemaPath: uiSchemaPath, operation: operation });
        const parameters = connectorData.actions.find((action: any) => action.name === operation)?.parameters || null;

        const connecterForm = <AddConnector formData={(formJSON as any).formJSON}
            nodePosition={sidePanelContext.nodeRange}
            documentUri={props.documentUri}
            connectorName={connectorData.name}
            connectionName={connection.name}
            operationName={operation}
            connectionType={connection.connectionType}
            parameters={parameters} />;

        sidepanelAddPage(sidePanelContext, connecterForm, `${sidePanelContext.isEditing ? "Edit" : "Add"} ${operation}`);
    }

    const clickEndpoint = async (endpoint: any) => {
        const callForm = <CallForm
            nodePosition={sidePanelContext.nodeRange}
            documentUri={props.documentUri}
            endpoint={endpoint.name}
            trailingSpace={props.trailingSpace} />;

        sidepanelAddPage(sidePanelContext, callForm, `Add Call Operation`, (<Icon name="HTTPEndpoint" sx={{ height: 25, width: 25, fontSize: 22, color: "#3e97d3" }} />));
    }

    const getConnectionLabel = (connectorName: string, connectionType: string) => {
        return `${FirstCharToUpperCase(connectorName)} ${connectionType ? `- ${connectionType} Connection` : ''}`;
    }

    const ConnectionList = () => {

        return (
            <>

                {isOldProject ? (
                    <OldProjectMessage>
                        <Codicon name="warning" />
                        Connector store is not supported with the old project structure.
                        Please migrate to use the connector store and other features.
                    </OldProjectMessage>
                ) : connections && (
                    <SectionContainer>
                        <SectionTitleWrapper>
                            <h4>Available Connections</h4>
                            {Object.values(connections).some(({ connections }) => connections.length > 0) && (
                                <LinkButton onClick={() => addNewConnection()}>
                                    <Codicon name="plus"/>Add new connection
                                </LinkButton>
                            )}
                        </SectionTitleWrapper>
                        {Object.values(connections).every(({ connections }) => connections.length === 0) ? (
                            <>
                                <MessageWrapper>
                                    No connections available. Please create a new connection.
                                </MessageWrapper>
                                <LinkButton onClick={() => addNewConnection()}>
                                    <Codicon name="plus"/>Add new connection
                                </LinkButton>
                            </>
                        ) : filteredConnections && (
                            <ConnectionWrapper>
                                {Object.keys(filteredConnections).map((key) => {
                                    return (
                                        <div key={key}>
                                            {filteredConnections[key].connections.map((connection, index) => (
                                                connection && (
                                                    <div key={index} style={{
                                                        backgroundColor: 'var(--vscode-editorWidget-background)',
                                                        border: '0px',
                                                        borderRadius: 2,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        justifyContent: 'left',
                                                        transition: '0.3s',
                                                        flexDirection: 'column',
                                                        marginBottom: '15px'
                                                    }}>
                                                        <ComponentCard
                                                            id={connection.name}
                                                            key={connection.name}
                                                            onClick={() => selectConnection(key, connection)}
                                                            sx={{
                                                                border: '0px',
                                                                borderRadius: 2,
                                                                padding: '6px 10px',
                                                                width: 'auto',
                                                                height: '32px'
                                                            }}
                                                        >
                                                            <CardContent>
                                                                <CardLabel>
                                                                    <IconContainer>
                                                                        <img
                                                                            src={filteredConnections[key]?.iconPathUri}
                                                                            alt="Icon"
                                                                            onError={(e) => {
                                                                                const target = e.target as HTMLImageElement;
                                                                                target.src = 'https://mi-connectors.wso2.com/icons/wordpress.gif'
                                                                            }}
                                                                        />
                                                                    </IconContainer>
                                                                    <div style={{
                                                                        width: '100%',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap',
                                                                        textAlign: 'left',
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        justifyContent: 'center'
                                                                    }}>
                                                                        <IconLabel>
                                                                            {connection.name}
                                                                        </IconLabel>
                                                                        <VersionTag>
                                                                            {getConnectionLabel(key, connection.connectionType)}
                                                                        </VersionTag>
                                                                    </div>
                                                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                                        {expandedConnections.includes(connection) ?
                                                                            <Codicon name={"chevron-up"} /> : <Codicon name={"chevron-down"} />
                                                                        }
                                                                    </div>
                                                                </CardLabel>
                                                            </CardContent>
                                                        </ComponentCard>
                                                        {(filteredOperations?.some(
                                                            ([filteredConnector]) =>
                                                                filteredConnector.name === connection.name
                                                        )
                                                            || (expandedConnections && expandedConnections.includes(connection))) &&
                                                            <div style={{ padding: 10 }}>
                                                                <div style={{ width: '100%', textAlign: 'left' }}>Select Operation</div>
                                                                <OperationGrid>
                                                                    {((filteredOperations.find(([filteredConnection]) => filteredConnection === connection)?.slice(1)[0])
                                                                        || filteredConnections[key].connectorData?.actions).map((operation: any) => {
                                                                            const allowedTypes = operation.allowedConnectionTypes;
                                                                            if (operation.isHidden || ((allowedTypes?.length > 0) && !(allowedTypes?.includes(connection.connectionType)))) {
                                                                                return null;
                                                                            }

                                                                            return (
                                                                                <ComponentCard
                                                                                    id={operation.name}
                                                                                    key={operation.name}
                                                                                    onClick={() => generateForm(
                                                                                        connection,
                                                                                        operation.name,
                                                                                        filteredConnections[key].connectorData
                                                                                    )}
                                                                                    sx={{
                                                                                        '&:hover, &.active': {
                                                                                            '.icon svg g': {
                                                                                                fill: 'var(--vscode-editor-foreground)'
                                                                                            },
                                                                                            backgroundColor: 'var(--vscode-pickerGroup-border)',
                                                                                            border: '0.5px solid var(--vscode-focusBorder)'
                                                                                        },
                                                                                        alignItems: 'center',
                                                                                        border: '0.5px solid var(--vscode-editor-foreground)',
                                                                                        borderRadius: 2,
                                                                                        cursor: 'pointer',
                                                                                        display: 'flex',
                                                                                        height: 20,
                                                                                        justifyContent: 'left',
                                                                                        marginBottom: 10,
                                                                                        padding: 10,
                                                                                        transition: '0.3s',
                                                                                        width: '160px'
                                                                                    }}
                                                                                >
                                                                                    <SmallIconContainer>
                                                                                        <img
                                                                                            src={filteredConnections[key]?.iconPathUri}
                                                                                            alt="Icon"
                                                                                            onError={(e) => {
                                                                                                const target = e.target as HTMLImageElement;
                                                                                                target.src = 'https://mi-connectors.wso2.com/icons/wordpress.gif'
                                                                                            }}
                                                                                        />
                                                                                    </SmallIconContainer>
                                                                                    <div style={{
                                                                                        width: '120px',
                                                                                        overflow: 'hidden',
                                                                                        textOverflow: 'ellipsis',
                                                                                        whiteSpace: 'nowrap'
                                                                                    }}>
                                                                                        <IconLabel>{FirstCharToUpperCase(operation.name)}</IconLabel>
                                                                                    </div>
                                                                                </ComponentCard>
                                                                            );
                                                                        })}
                                                                </OperationGrid>
                                                            </div>
                                                        }
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    );
                                })}
                            </ConnectionWrapper>
                        )}
                    </SectionContainer>
                )}
            </>
        )
    }


    const EndpointList = () => {

        return (
            <>

                {endpoints && (
                    <SectionContainer>
                        <SectionTitleWrapper>
                            <h4>Available Endpoints</h4>
                            {endpoints.length > 0 && (
                                <LinkButton onClick={() => addNewEndpoint()}>
                                    <Codicon name="plus"/> Add new endpoint
                                </LinkButton>
                            )}
                        </SectionTitleWrapper>
                        {endpoints.length === 0 ? (
                            <>
                                <MessageWrapper>
                                    No Endpoints available. Please create a new endpoint.
                                </MessageWrapper>
                                <LinkButton onClick={() => addNewEndpoint()}>
                                    <Codicon name="plus" /> Add new endpoint
                                </LinkButton>
                            </>
                        ) : filteredEndpoints && filteredEndpoints.length > 0 && (
                            <ConnectionWrapper>
                                {filteredEndpoints.map((endpoint, index) => (
                                    endpoint && (
                                        <div key={index} style={{
                                            backgroundColor: 'var(--vscode-editorWidget-background)',
                                            border: '0px',
                                            borderRadius: 2,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'left',
                                            transition: '0.3s',
                                            flexDirection: 'column',
                                            marginBottom: '15px'
                                        }}>
                                            <ComponentCard
                                                key={endpoint.name}
                                                onClick={() => clickEndpoint(endpoint)}
                                                sx={{
                                                    border: '0px',
                                                    borderRadius: 2,
                                                    padding: '6px 10px',
                                                    width: 'auto',
                                                    height: '32px'
                                                }}
                                            >
                                                <CardContent>
                                                    <CardLabel>
                                                        <IconContainer>
                                                            <Icon
                                                                name="HTTPEndpoint"
                                                                sx={{ height: 25, width: 25, fontSize: 25, color: "#3e97d3" }}
                                                            />
                                                        </IconContainer>
                                                        <div style={{
                                                            width: '100%',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            textAlign: 'left',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <IconLabel>
                                                                {endpoint.name}
                                                            </IconLabel>
                                                            <VersionTag>
                                                                {endpoint.type}
                                                            </VersionTag>
                                                        </div>
                                                    </CardLabel>
                                                </CardContent>
                                            </ComponentCard>
                                        </div>
                                    )
                                ))}
                            </ConnectionWrapper>
                        )}
                    </SectionContainer>
                )}
            </>
        )
    }

    return (
        <ExternalsContainer>
            <ConnectionList />
            <EndpointList />
        </ExternalsContainer>
    );
}
