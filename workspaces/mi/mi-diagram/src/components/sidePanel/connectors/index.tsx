/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { TextField, Button, Codicon, Icon, ComponentCard, IconLabel, AutoComplete } from "@wso2-enterprise/ui-toolkit";
import React, { useContext, useEffect, useState } from "react";
import styled from "@emotion/styled";
import SidePanelContext from "../SidePanelContexProvider";
import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import AddConnector from "../Pages/AddConnector";

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
    width: 40px;

    & img {
        width: 25px;
    }
`;

const ButtonGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: 5px 5px;
`;

const OperationGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px 5px;
    padding-top: 10px;
`;

const TitleWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
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
`;

export interface ConnectorPageProps {
    documentUri: string;
    setContent: any;
    searchValue?: string;
    clearSearch?: () => void;
}

export function ConnectorPage(props: ConnectorPageProps) {
    const sidePanelContext = useContext(SidePanelContext);
    const { rpcClient } = useVisualizerContext();
    // const [selectedConnector, setSelectedConnector] = useState(undefined);
    const [expandedConnectors, setExpandedConnectors] = useState<any[]>([]);
    const [localConnectors, setLocalConnectors] = useState<any[]>([]);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isGeneratingForm, setIsGeneratingForm] = useState(false);
    const [filteredStoreConnectors, setFilteredStoreConnectors] = useState<any[]>([]);
    const [filteredLocalConnectors, setFilteredLocalConnectors] = useState<any[]>([]);
    const [filteredOperations, setFilteredOperations] = useState<any[][]>([]);

    const fetchConnectors = async () => {
        const response = await fetch('https://raw.githubusercontent.com/rosensilva/connectors/main/connectors_list.json');
        const data = await response.json();
        sidePanelContext.setSidePanelState({
            ...sidePanelContext,
            connectors: data.data,
        });
    };

    const fetchLocalConnectorData = async () => {
        const connectorData = await rpcClient.getMiDiagramRpcClient().getAvailableConnectors({ documentUri: props.documentUri, connectorName: "" });
        if (connectorData) {
            const connectorsWithIcons = await Promise.all(connectorData.connectors.map(async (connector) => {
                const iconPathUri = await rpcClient.getMiDiagramRpcClient().getIconPathUri({ path: connector.iconPath, name: "icon-small" });
                return { ...connector, iconPathUri };
            }));
            setLocalConnectors(connectorsWithIcons);
        }
    };

    useEffect(() => {
        fetchLocalConnectorData();

        if (!sidePanelContext.connectors || sidePanelContext.connectors.length === 0) {
            fetchConnectors();
        }
    }, []);

    useEffect(() => {
        let storeConnectorsFiltered = sidePanelContext.connectors;
        let localConnectorsFiltered = localConnectors;
        let operationsFiltered = [];

        setExpandedConnectors([]);

        if (props.searchValue) {
            storeConnectorsFiltered = searchStoreConnectors(props.searchValue);
            localConnectorsFiltered = searchLocalConnectors(props.searchValue);
            operationsFiltered = searchOperations(props.searchValue);

            setFilteredOperations(operationsFiltered);
        } else {
            setFilteredOperations([]);
        }

        if (storeConnectorsFiltered) {
            storeConnectorsFiltered = storeConnectorsFiltered.filter(connector => !existsInLocalConnectors(connector));
        }

        setFilteredLocalConnectors(localConnectorsFiltered);
        setFilteredStoreConnectors(storeConnectorsFiltered);
    }, [props.searchValue])

    const searchStoreConnectors = (searchValue: string) => {
        return sidePanelContext.connectors && sidePanelContext.connectors
            .filter(connector => {
                const connectorNameMatches = connector.name.toLowerCase().includes(searchValue.toLowerCase());

                const operationNameMatches = connector.operations && Object.keys(connector.operations).some((operation: any) =>
                    operation.toLowerCase().includes(searchValue.toLowerCase())
                );

                return (connectorNameMatches || operationNameMatches) && !existsInLocalConnectors(connector);
            });
    }

    const searchLocalConnectors = (searchValue: string) => {
        return localConnectors.filter(connector => {
            const connectorNameMatches = connector.name.toLowerCase().includes(searchValue.toLowerCase());

            const actionNameMatches = connector.actions && connector.actions.some((action: any) =>
                action.name.toLowerCase().includes(searchValue.toLowerCase())
            );

            return connectorNameMatches || actionNameMatches;
        });
    }

    const searchOperations = (searchValue: string) => {
        const connectorsAndActions: any[][] = [];

        localConnectors.forEach(connector => {
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
                Object.keys(connector.operations).forEach((operation: any) => {
                    if (operation.toLowerCase().includes(searchValue.toLowerCase())) {
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
                        connector: connector.name,
                        url: connector.download_url,
                        version: connector.version
                    });
                    downloadSuccess = true;
                } catch (error) {
                    console.error('Error occurred while downloading connector:', error);
                    attempts++;
                }
            }

            if (!downloadSuccess) {
                console.error('Failed to download connector after 3 attempts');
            }
            setIsDownloading(false);
        }

        setIsGeneratingForm(true);

        // Add 1s timeout to unzip the downloaded connected
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get Connector Data from LS
        const connectorData = await rpcClient.getMiDiagramRpcClient().getAvailableConnectors({
            documentUri: props.documentUri,
            connectorName: connector.name.toLowerCase().replace(/\s/g, '')
        });

        if (connectorData) {

            // Retrieve form
            const formJSON = await rpcClient.getMiDiagramRpcClient().getConnectorForm({ uiSchemaPath: connectorData.uiSchemaPath, operation: operation });
            const iconPathUri = await rpcClient.getMiDiagramRpcClient().getIconPathUri({ path: connectorData.iconPath, name: "icon-small" });

            const connecterForm = <AddConnector formData={(formJSON as any).formJSON}
                nodePosition={sidePanelContext.nodeRange}
                documentUri={props.documentUri}
                connectorName={connector.name}
                operationName={operation} />;

            props.setContent(connecterForm, `${sidePanelContext.isEditing ? "Edit" : "Add"} ${operation}`, iconPathUri.uri);
        } else {
            fetchLocalConnectorData();
        }

        setIsGeneratingForm(false);
    }

    function existsInLocalConnectors(connector: any) {
        return localConnectors.some(localConnector =>
            localConnector.name.toLowerCase() === connector.name.toLowerCase().replace(/\s/g, '') && localConnector.version === connector.version);
    }


    const ConnectorList = () => {
        let displayedStoreConnectors = sidePanelContext.connectors;
        let displayeLocalConnectors = localConnectors;

        if (displayedStoreConnectors) {
            displayedStoreConnectors = displayedStoreConnectors.filter(connector => !existsInLocalConnectors(connector));
        }

        if (props.searchValue) {
            displayedStoreConnectors = filteredStoreConnectors;
            displayeLocalConnectors = filteredLocalConnectors;
        }


        return (
            <>
                {isDownloading ? (
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
                            <h4>Local Connectors</h4>
                            {!displayeLocalConnectors ? (
                                <LoaderWrapper>
                                    <ProgressRing />
                                    Loading connectors...
                                </LoaderWrapper>
                            ) : (
                                <ButtonGrid>
                                    {displayeLocalConnectors.map((connector: any) => (
                                        <ComponentCard
                                            key={connector.name}
                                            onClick={() => selectConnector(connector)}
                                            sx={{
                                                '&:hover, &.active': {
                                                    ...(expandedConnectors.includes(connector) && {
                                                        '.icon svg g': {
                                                            fill: 'var(--vscode-editor-foreground)'
                                                        },
                                                        backgroundColor: 'var(--vscode-pickerGroup-border)',
                                                        border: '0.5px solid var(--vscode-focusBorder)'
                                                    })
                                                },
                                                alignItems: 'center',
                                                border: '0.5px solid var(--vscode-editor-foreground)',
                                                borderRadius: 2,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'left',
                                                marginBottom: 10,
                                                padding: 10,
                                                transition: '0.3s',
                                                width: 'calc(100% - 25px)'
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
                                                        textAlign: 'left'
                                                    }}>
                                                        <IconLabel>
                                                            {connector.name}
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
                                                {(filteredOperations.some(
                                                    ([filteredConnector]) =>
                                                        filteredConnector.name === connector.name
                                                )
                                                    || (expandedConnectors && expandedConnectors.includes(connector))) && (
                                                        <OperationGrid>
                                                            {((filteredOperations.find(([filteredConnector]) => filteredConnector === connector)?.slice(1))
                                                                || (connector.actions)).map((operation: any) => {
                                                                    // If operation is hidden, do not render the ComponentCard
                                                                    if (operation.isHidden) {
                                                                        return null;
                                                                    }

                                                                    return (
                                                                        <ComponentCard
                                                                            key={operation}
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
                                                                                padding: 10,
                                                                                transition: '0.3s',
                                                                                width: 170
                                                                            }}
                                                                        >
                                                                            <div style={{
                                                                                width: '100%',
                                                                                overflow: 'hidden',
                                                                                textOverflow: 'ellipsis',
                                                                                whiteSpace: 'nowrap',
                                                                                textAlign: 'left'
                                                                            }}>
                                                                                <IconLabel>{operation.name}</IconLabel>
                                                                            </div>
                                                                        </ComponentCard>
                                                                    );
                                                                })}
                                                        </OperationGrid>
                                                    )
                                                }
                                            </CardContent>
                                        </ComponentCard>
                                    ))}
                                </ButtonGrid>
                            )}
                        </div>
                        <div>
                            <h4>Store Connectors</h4>
                            {!displayedStoreConnectors ? (
                                <LoaderWrapper>
                                    <ProgressRing />
                                    Fetching connectors...
                                </LoaderWrapper>
                            ) :
                                <ButtonGrid>
                                    {(displayedStoreConnectors.sort((a: any, b: any) => a.rank - b.rank).map((connector: any) => (
                                        <ComponentCard
                                            key={connector.name}
                                            onClick={() => selectConnector(connector)}
                                            sx={{
                                                '&:hover, &.active': {
                                                    ...(expandedConnectors.includes(connector) && {
                                                        '.icon svg g': {
                                                            fill: 'var(--vscode-editor-foreground)'
                                                        },
                                                        backgroundColor: 'var(--vscode-pickerGroup-border)',
                                                        border: '0.5px solid var(--vscode-focusBorder)'
                                                    })
                                                },
                                                alignItems: 'center',
                                                border: '0.5px solid var(--vscode-editor-foreground)',
                                                borderRadius: 2,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'left',
                                                marginBottom: 10,
                                                padding: 10,
                                                transition: '0.3s',
                                                width: 'calc(100% - 25px)'
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
                                                        textAlign: 'left'
                                                    }}>
                                                        <IconLabel>
                                                            {connector.name}
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
                                                {(filteredOperations.some(
                                                    ([filteredConnector]) =>
                                                        filteredConnector.name === connector.name
                                                )
                                                    || (expandedConnectors && expandedConnectors.includes(connector))) && (
                                                        <OperationGrid>
                                                            {((filteredOperations.find(([filteredConnector]) => filteredConnector === connector)?.slice(1))
                                                                || connector.operations).map((operation: any) => {
                                                                    // If operation is hidden, do not render the ComponentCard
                                                                    if (operation.isHidden) {
                                                                        return null;
                                                                    }

                                                                    return (
                                                                        <ComponentCard
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
                                                                                padding: 10,
                                                                                transition: '0.3s',
                                                                                width: 170
                                                                            }}
                                                                        >
                                                                            <div style={{
                                                                                width: '100%',
                                                                                overflow: 'hidden',
                                                                                textOverflow: 'ellipsis',
                                                                                whiteSpace: 'nowrap',
                                                                                textAlign: 'left'
                                                                            }}>
                                                                                <IconLabel>{operation.name}</IconLabel>
                                                                            </div>
                                                                        </ComponentCard>
                                                                    );
                                                                })}
                                                        </OperationGrid>
                                                    )
                                                }
                                            </CardContent>
                                        </ComponentCard>
                                    ))
                                    )}
                                </ButtonGrid>
                            }
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
