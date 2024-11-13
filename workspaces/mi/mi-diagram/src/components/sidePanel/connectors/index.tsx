/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Codicon, ComponentCard, IconLabel } from "@wso2-enterprise/ui-toolkit";
import React, { useContext, useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import SidePanelContext from "../SidePanelContexProvider";
import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import AddConnector from "../Pages/AddConnector";
import { ConnectorStatus } from "@wso2-enterprise/mi-core";
import { sidepanelAddPage } from "..";
import { FirstCharToUpperCase } from "../../../utils/commons";
import { APIS } from "../../../resources/constants";

const LoaderWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-top: 15px;
    height: 100px;
    width: 100%;
`;

const ProgressRing = styled(VSCodeProgressRing)`
    height: 50px;
    width: 50px;
    margin-top: auto;
    padding: 4px;
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

const ButtonGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: 5px 5px;
    margin-bottom: 5px;
`;

const OperationGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px 5px;
    padding-top: 10px;
`;

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
    justify-content: space-between;
    gap: 10px;
`;

const OldProjectMessage = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding-top: 20px;
    gap: 10px;
`;


export interface ConnectorPageProps {
    documentUri: string;
    searchValue?: string;
    clearSearch?: () => void;
    nodePosition: any;
}

export function ConnectorPage(props: ConnectorPageProps) {
    const sidePanelContext = useContext(SidePanelContext);
    const { rpcClient } = useVisualizerContext();
    // const [selectedConnector, setSelectedConnector] = useState(undefined);
    const [expandedConnectors, setExpandedConnectors] = useState<any[]>([]);
    const [localConnectors, setLocalConnectors] = useState<any[]>(undefined);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isGeneratingForm, setIsGeneratingForm] = useState(false);
    const [filteredStoreConnectors, setFilteredStoreConnectors] = useState<any[]>([]);
    const [filteredLocalConnectors, setFilteredLocalConnectors] = useState<any[]>([]);
    const [filteredOperations, setFilteredOperations] = useState<any[][]>([]);
    const [debouncedValue, setDebouncedValue] = useState(props.searchValue);
    const [isOldProject, setIsOldProject] = useState(false);
    const connectionStatus = useRef(null);

    const fetchConnectors = async () => {
        try {
            const response = await rpcClient.getMiDiagramRpcClient().getStoreConnectorJSON();
            const data = response.outboundConnectors;
            sidePanelContext.setSidePanelState({
                ...sidePanelContext,
                connectors: data,
            });
        } catch (e) {
            console.error("Error fetching connectors", e);
        }
    };

    const fetchLocalConnectorData = async () => {
        const connectorData = await rpcClient.getMiDiagramRpcClient().getAvailableConnectors({ documentUri: props.documentUri, connectorName: "" });
        if (connectorData) {
            const connectorsWithIcons = await Promise.all(connectorData.connectors.map(async (connector) => {
                const iconPathUri = await rpcClient.getMiDiagramRpcClient().getIconPathUri({ path: connector.iconPath, name: "icon-small" });
                return { ...connector, iconPathUri };
            }));
            setLocalConnectors(connectorsWithIcons);
        } else {
            setLocalConnectors([]);
        }
    };

    const checkOldProject = async () => {
        const oldProjectResponse = await rpcClient.getMiDiagramRpcClient().checkOldProject();
        setIsOldProject(oldProjectResponse);
    };

    useEffect(() => {
        checkOldProject();

        rpcClient?.onConnectorStatusUpdate((connectorStatus: ConnectorStatus) => {
            connectionStatus.current = connectorStatus;
        });

        fetchLocalConnectorData();

        if (!sidePanelContext.connectors || sidePanelContext.connectors.length === 0) {
            fetchConnectors();
        }
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(props.searchValue);
        }, 400);
    
        return () => {
            clearTimeout(handler);
        };
    }, [props.searchValue]);

    useEffect(() => {
        let storeConnectorsFiltered = sidePanelContext.connectors;
        let localConnectorsFiltered = localConnectors;
        let operationsFiltered = [];

        setExpandedConnectors([]);

        if (debouncedValue) {
            storeConnectorsFiltered = searchStoreConnectors(debouncedValue);
            localConnectorsFiltered = searchLocalConnectors(debouncedValue);
            operationsFiltered = searchOperations(debouncedValue);

            setFilteredOperations(operationsFiltered);
        } else {
            setFilteredOperations([]);
        }

        if (storeConnectorsFiltered) {
            storeConnectorsFiltered = storeConnectorsFiltered.filter(connector => !existsInLocalConnectors(connector));
        }

        setFilteredLocalConnectors(localConnectorsFiltered);
        setFilteredStoreConnectors(storeConnectorsFiltered);
    }, [debouncedValue, localConnectors, sidePanelContext.connectors]);

    const waitForEvent = () => {
        return new Promise((resolve, reject) => {
            const checkInterval = setInterval(() => {
                if (connectionStatus.current) {
                    clearInterval(checkInterval);
                    resolve(connectionStatus.current);
                }
            }, 200);

            // Reject the promise after 10 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
                reject(new Error('Event did not occur within 10 seconds'));
            }, 10000);
        });
    };

    const searchStoreConnectors = (searchValue: string) => {
        return sidePanelContext.connectors && sidePanelContext.connectors
            .filter(connector => {
                const connectorNameMatches = connector.name.toLowerCase().includes(searchValue.toLowerCase());

                const operationNameMatches = connector.operations && connector.operations.some((operation: any) =>
                    operation.name.toLowerCase().includes(searchValue.toLowerCase())
                );

                return (connectorNameMatches || operationNameMatches) && !existsInLocalConnectors(connector);
            });
    }

    const searchLocalConnectors = (searchValue: string) => {
        return localConnectors?.filter(connector => {
            const connectorNameMatches = connector.name.toLowerCase().includes(searchValue.toLowerCase());

            const actionNameMatches = connector.actions && connector.actions.some((action: any) =>
                action.name.toLowerCase().includes(searchValue.toLowerCase())
            );

            return connectorNameMatches || actionNameMatches;
        });
    }

    const searchOperations = (searchValue: string) => {
        const connectorsAndActions: any[][] = [];

        localConnectors?.forEach(connector => {
            const matchingActions: any[] = [];

            const connectorNameMatches = connector.name.toLowerCase().includes(searchValue.toLowerCase());
            if (!connectorNameMatches) {
                connector.actions.forEach((action: any) => {
                    if (action.name.toLowerCase().includes(searchValue.toLowerCase())) {
                        matchingActions.push(action);
                    }
                });
            }

            if (matchingActions.length > 0) {
                connectorsAndActions.push([connector, ...matchingActions]);
            }
        });

        sidePanelContext.connectors && sidePanelContext.connectors.forEach(connector => {
            const matchingActions: any[] = [];

            const connectorNameMatches = connector.name.toLowerCase().includes(searchValue.toLowerCase());

            if (!connectorNameMatches) {
                connector.operations.forEach((operation: any) => {
                    if (operation.name.toLowerCase().includes(searchValue.toLowerCase())) {
                        matchingActions.push(operation);
                    }
                });
            }

            if (matchingActions.length > 0) {
                connectorsAndActions.push([connector, ...matchingActions]);
            }
        });
        return connectorsAndActions;
    }

    const selectConnector = async (connector: any) => {
        if (expandedConnectors.includes(connector)) {
            setExpandedConnectors(expandedConnectors.filter(item => item !== connector));
        } else {
            setExpandedConnectors([...expandedConnectors, connector]);
        }
    }

    const selectOperation = async (connector: any, operation: string) => {

        // Download connector from store
        if (connector.operations) {
            setIsDownloading(true);
            let downloadSuccess = false;
            let attempts = 0;

            while (!downloadSuccess && attempts < 3) {
                try {
                    await rpcClient.getMiDiagramRpcClient().downloadConnector({
                        url: connector.download_url
                    });
                    downloadSuccess = true;
                } catch (error) {
                    console.error('Error occurred while downloading connector:', error);
                    attempts++;
                }
            }

            if (downloadSuccess) {
                try {
                    const status: any = await waitForEvent();

                    if (status.connector === connector.name && status.isSuccess) {
                        generateForm(connector, operation);
                    } else {
                        fetchLocalConnectorData();
                        console.log(status.message);
                    }
                } catch (error) {
                    console.log(error);
                }
            } else {
                console.error('Failed to download connector after 3 attempts');
            }
            setIsDownloading(false);
        } else {
            // Generate form for local connector
            generateForm(connector, operation);
        }
    }

    const generateForm = async (connector: any, operation: string) => {
        setIsGeneratingForm(true);

        // Get Connector Data from LS
        const connectorData = await rpcClient.getMiDiagramRpcClient().getAvailableConnectors({
            documentUri: props.documentUri,
            connectorName: connector.name.toLowerCase().replace(/\s/g, '')
        });

        if (connectorData) {

            // Retrieve form
            const formJSON = await rpcClient.getMiDiagramRpcClient().getConnectorForm({ uiSchemaPath: connectorData.uiSchemaPath, operation: operation });
            const iconPathUri = await rpcClient.getMiDiagramRpcClient().getIconPathUri({ path: connectorData.iconPath, name: "icon-small" });
            const parameters = connectorData.actions.find(action => action.name === operation)?.parameters || null;

            const connecterForm = <AddConnector formData={(formJSON as any).formJSON}
                nodePosition={sidePanelContext.nodeRange}
                documentUri={props.documentUri}
                connectorName={connector.name}
                operationName={operation}
                fromConnectorStore={true}
                parameters={parameters} />;

            sidepanelAddPage(sidePanelContext, connecterForm, `${sidePanelContext.isEditing ? "Edit" : "Add"} ${operation}`, iconPathUri.uri);
        } else {
            fetchLocalConnectorData();
        }

        setIsGeneratingForm(false);
    }

    function existsInLocalConnectors(connector: any) {
        return localConnectors?.some(localConnector =>
            localConnector.name.toLowerCase() === connector.name.toLowerCase().replace(/\s/g, '') && localConnector.version === connector.version);
    }

    const ConnectorList = () => {

        let displayedStoreConnectors: any[] = undefined;
        let displayeLocalConnectors = localConnectors;

        if (displayeLocalConnectors) {
            displayedStoreConnectors = sidePanelContext.connectors;
            if (displayedStoreConnectors) {
                displayedStoreConnectors = displayedStoreConnectors.filter(connector => !existsInLocalConnectors(connector));
            }
        }

        if (props.searchValue) {
            displayedStoreConnectors = filteredStoreConnectors;
            displayeLocalConnectors = filteredLocalConnectors;
        }


        return (
            <>
                <h4>Available Connectors</h4>
                {isOldProject ? (
                    <OldProjectMessage>
                        <Codicon name="warning" />
                        Connector store is not supported with the old project structure.
                        Please migrate to use the connector store and other features.
                    </OldProjectMessage>
                ) : isDownloading ? (
                    <LoaderWrapper>
                        <ProgressRing />
                        Downloading connector...
                    </LoaderWrapper>
                ) : isGeneratingForm ? (
                    <LoaderWrapper>
                        <ProgressRing />
                        Generating options...
                    </LoaderWrapper>
                ) : (
                    <>
                        <div>
                            {(!displayeLocalConnectors || (displayeLocalConnectors.length === 0)) ? (
                                <></>
                            ) : (
                                <ButtonGrid>
                                    {displayeLocalConnectors.map((connector: any) => (
                                        <div key={`${connector.name}-${connector.version}`} style={{
                                            '&:hover, &.active': {
                                                ...(expandedConnectors.includes(connector) && {
                                                    '.icon svg g': {
                                                        fill: 'var(--vscode-editor-foreground)'
                                                    },
                                                    backgroundColor: 'var(--vscode-pickerGroup-border)'
                                                })
                                            },
                                            backgroundColor: 'var(--vscode-editorWidget-background)',
                                            border: '0px',
                                            borderRadius: 2,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'left',
                                            transition: '0.3s',
                                            flexDirection: 'column',
                                            marginBottom: '10px'
                                        }}>
                                            <ComponentCard
                                                id={connector.name}
                                                key={`${connector.name}-${connector.version}`}
                                                onClick={() => selectConnector(connector)}
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
                                                                src={connector.iconPathUri.uri}
                                                                alt="Icon"
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
                                                                {FirstCharToUpperCase(connector.name)}
                                                            </IconLabel>
                                                            <VersionTag>
                                                                {connector.version}
                                                            </VersionTag>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                            {expandedConnectors.includes(connector) ?
                                                                <Codicon name={"chevron-up"} /> : <Codicon name={"chevron-down"} />
                                                            }
                                                        </div>
                                                    </CardLabel>
                                                </CardContent>
                                            </ComponentCard>
                                            {(filteredOperations.some(
                                                ([filteredConnector]) =>
                                                    filteredConnector.name === connector.name
                                            )
                                                || (expandedConnectors && expandedConnectors.includes(connector))) && (
                                                    <div style={{
                                                        padding: '10px',
                                                    }}>
                                                        <div style={{ width: '100%', textAlign: 'left' }}>Select Operation</div>
                                                        <OperationGrid>
                                                            {((filteredOperations.find(([filteredConnector]) => filteredConnector === connector)?.slice(1))
                                                                || (connector.actions)).map((operation: any) => {
                                                                    // If operation is hidden, do not render the ComponentCard
                                                                    if (operation.isHidden) {
                                                                        return null;
                                                                    }

                                                                    return (
                                                                        <ComponentCard
                                                                            id={operation.name}
                                                                            key={operation.name}
                                                                            onClick={() => selectOperation(connector, operation.name)}
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
                                                                                    src={connector.iconPathUri.uri}
                                                                                    alt="Icon"
                                                                                />
                                                                            </SmallIconContainer>
                                                                            <div style={{
                                                                                width: '100%',
                                                                                overflow: 'hidden',
                                                                                textOverflow: 'ellipsis',
                                                                                whiteSpace: 'nowrap',
                                                                                textAlign: 'left'
                                                                            }}>
                                                                                <IconLabel>{FirstCharToUpperCase(operation.name)}</IconLabel>
                                                                            </div>
                                                                        </ComponentCard>
                                                                    );
                                                                })}
                                                        </OperationGrid>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    ))}
                                </ButtonGrid>
                            )}
                        </div>
                        <div>
                            {!sidePanelContext.connectors ? (
                                <LoaderWrapper>
                                    <ProgressRing />
                                    Fetching connectors...
                                </LoaderWrapper>
                            ) : displayedStoreConnectors && (
                                <ButtonGrid>
                                    {(displayedStoreConnectors.sort((a: any, b: any) => a.rank - b.rank).map((connector: any) => (
                                        <div key={`${connector.name}-${connector.version}`} style={{
                                            '&:hover, &.active': {
                                                ...(expandedConnectors.includes(connector) && {
                                                    '.icon svg g': {
                                                        fill: 'var(--vscode-editor-foreground)'
                                                    },
                                                    backgroundColor: 'var(--vscode-pickerGroup-border)'
                                                })
                                            },
                                            backgroundColor: 'var(--vscode-editorWidget-background)',
                                            border: '0px',
                                            borderRadius: 2,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'left',
                                            transition: '0.3s',
                                            flexDirection: 'column',
                                            marginBottom: '10px'
                                        }}>
                                            <ComponentCard
                                                id={connector.name}
                                                key={`${connector.name}-${connector.version}`}
                                                onClick={() => selectConnector(connector)}
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
                                                                src={connector.icon_url}
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
                                                                {FirstCharToUpperCase(connector.name)}
                                                            </IconLabel>
                                                            <VersionTag>
                                                                {connector.version}
                                                            </VersionTag>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                            {expandedConnectors.includes(connector) ?
                                                                <Codicon name={"chevron-up"} /> : <Codicon name={"chevron-down"} />
                                                            }
                                                        </div>
                                                    </CardLabel>
                                                </CardContent>
                                            </ComponentCard>
                                            {(filteredOperations.some(
                                                ([filteredConnector]) =>
                                                    filteredConnector.name === connector.name
                                            )
                                                || (expandedConnectors && expandedConnectors.includes(connector))) && (
                                                    <div style={{
                                                        padding: '10px',
                                                    }}>
                                                        <div style={{ width: '100%', textAlign: 'left' }}>Select Operation</div>
                                                        <OperationGrid>
                                                            {((filteredOperations.find(([filteredConnector]) => filteredConnector === connector)?.slice(1))
                                                                || connector.operations).map((operation: any) => {
                                                                    // If operation is hidden, do not render the ComponentCard
                                                                    if (operation.isHidden) {
                                                                        return null;
                                                                    }

                                                                    return (
                                                                        <ComponentCard
                                                                            id={operation.name}
                                                                            key={operation.name}
                                                                            onClick={() => selectOperation(connector, operation.name)}
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
                                                                                    src={connector.icon_url}
                                                                                    alt="Icon"
                                                                                    onError={(e) => {
                                                                                        const target = e.target as HTMLImageElement;
                                                                                        target.src = 'https://mi-connectors.wso2.com/icons/wordpress.gif'
                                                                                    }}
                                                                                />
                                                                            </SmallIconContainer>
                                                                            <div style={{
                                                                                width: '100%',
                                                                                overflow: 'hidden',
                                                                                textOverflow: 'ellipsis',
                                                                                whiteSpace: 'nowrap',
                                                                                textAlign: 'left'
                                                                            }}>
                                                                                <IconLabel>{FirstCharToUpperCase(operation.name)}</IconLabel>
                                                                            </div>
                                                                        </ComponentCard>
                                                                    );
                                                                })}
                                                        </OperationGrid>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    ))
                                    )}
                                </ButtonGrid>
                            )}
                        </div>
                    </>
                )}
            </>
        )
    }

    return (
        <div>
            <ConnectorList />
        </div>
    );
}
