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
import { getSVGIcon } from "../../../resources/icons/mediatorIcons/icons";
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
    grid-template-columns: 1fr 1fr;
    gap: 5px 5px;
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

export interface ConnectorPageProps {
    documentUri: string;
    setContent: any;
    searchValue?: string;
    clearSearch?: () => void;
}

export function ConnectorPage(props: ConnectorPageProps) {
    const sidePanelContext = useContext(SidePanelContext);
    const { rpcClient } = useVisualizerContext();
    const [selectedConnector, setSelectedConnector] = useState(undefined);
    const [localConnectors, setLocalConnectors] = useState<any[]>([]);

    const fetchConnectors = async () => {
        const response = await fetch('https://raw.githubusercontent.com/rosensilva/connectors/main/connectors_list.json');
        const data = await response.json();
        sidePanelContext.setSidePanelState({
            ...sidePanelContext,
            connectors: data.data,
        });
    };

    useEffect(() => {
        const fetchLocalConnectorData = async () => {
            const connectorData = await rpcClient.getMiDiagramRpcClient().getAvailableConnectors({ documentUri: props.documentUri });
            if (connectorData) {
                setLocalConnectors(connectorData.connectors);
            }
        };

        fetchLocalConnectorData();

        if (!sidePanelContext.connectors || sidePanelContext.connectors.length === 0) {
            fetchConnectors();
        }
    }, []);

    const searchStoreConnectors = (searchValue: string) => {
        return sidePanelContext.connectors && sidePanelContext.connectors.filter(connector => connector.name.toLowerCase().includes(searchValue.toLowerCase()));
    }

    const searchLocalConnectors = (searchValue: string) => {
        return localConnectors && localConnectors.filter(connector => connector.name.toLowerCase().includes(searchValue.toLowerCase()));
    }

    const searchOperations = (searchValue: string) => {
        if (selectedConnector.operations) {
            return Object.keys(selectedConnector.operations).filter(key => key.toLowerCase().includes(searchValue.toLowerCase()));
        }

        return selectedConnector.actions.filter((action: any) => action.name.toLowerCase().includes(searchValue.toLowerCase()));
    }

    const selectConnector = async (connector: any) => {
        setSelectedConnector(connector);
        props.clearSearch();
    }

    const selectOperation = async (operation: string) => {

        // Download connector from store
        if (selectedConnector.operations) {
            await rpcClient.getMiDiagramRpcClient().downloadConnector({
                connector: selectedConnector.name,
                url: selectedConnector.download_url,
                version: selectedConnector.version
            });
        }

        // Get Connector Data from LS
        const connectorData = await rpcClient.getMiDiagramRpcClient().getAvailableConnectors({ documentUri: props.documentUri });

        // // Update LS with new connector
        await rpcClient.getMiDiagramRpcClient().updateConnectors({ documentUri: props.documentUri });

        // Get UI Schema Path
        const uiSchemaPath = connectorData.connectors.find((connector: any) => connector.name === selectedConnector.name.toLowerCase())?.uiSchemaPath;

        // Retrieve form
        const formJSON = await rpcClient.getMiDiagramRpcClient().getConnectorForm({ uiSchemaPath: uiSchemaPath, operation: operation });

        const connecterForm = <AddConnector formData={(formJSON as any).formJSON} nodePosition={sidePanelContext.nodeRange} documentUri={props.documentUri} />;

        props.setContent(connecterForm, `${sidePanelContext.isEditing ? "Edit" : "Add"} ${operation}`);
    }

    const onBackClick = async () => {
        setSelectedConnector(undefined);
        props.clearSearch();
    }

    const ConnectorList = () => {
        let storeConnectors = sidePanelContext.connectors;
        let localConnectorsFiltered = localConnectors;
        let operationsFiltered = selectedConnector ?
            (selectedConnector.operations ? Object.keys(selectedConnector.operations) : selectedConnector.actions)
            : undefined;
        if (props.searchValue) {
            if (selectedConnector) {
                operationsFiltered = searchOperations(props.searchValue);
            } else {
                storeConnectors = searchStoreConnectors(props.searchValue);
                localConnectorsFiltered = searchLocalConnectors(props.searchValue);
            }
        }

        return (
            <>
                {!selectedConnector ?
                    (
                        <>
                            <div>
                                <h4>Local Connectors</h4>
                                {!localConnectorsFiltered ? (
                                    <LoaderWrapper>
                                        <ProgressRing />
                                        Loading connectors...
                                    </LoaderWrapper>
                                ) : (
                                    <ButtonGrid>
                                        {localConnectorsFiltered.map((connector: any) => (
                                            <ComponentCard
                                                key={connector.name}
                                                onClick={() => setSelectedConnector(connector)}
                                                sx={{
                                                    '&:hover, &.active': {
                                                        '.icon svg g': {
                                                            fill: 'var(--vscode-editor-foreground)'
                                                        },
                                                        backgroundColor: 'var(--vscode-pickerGroup-border)',
                                                        border: '1px solid var(--vscode-focusBorder)'
                                                    },
                                                    alignItems: 'center',
                                                    border: '1px solid var(--vscode-editor-foreground)',
                                                    borderRadius: 2,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    height: 20,
                                                    justifyContent: 'left',
                                                    marginBottom: 10,
                                                    padding: 10,
                                                    transition: '0.3s',
                                                    width: 180
                                                }}
                                            >
                                                <IconContainer>
                                                    {getSVGIcon("Aggregate")}
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
                                            </ComponentCard>
                                        ))}
                                    </ButtonGrid>
                                )}
                            </div>
                            <div>
                                <h4>Store Connectors</h4>
                                {!storeConnectors ? (
                                    <LoaderWrapper>
                                        <ProgressRing />
                                        Fetching connectors...
                                    </LoaderWrapper>
                                ) :
                                    <ButtonGrid>
                                        {storeConnectors.sort((a: any, b: any) => a.rank - b.rank).map((connector: any) => (
                                            <ComponentCard
                                                key={connector.name}
                                                onClick={() => selectConnector(connector)}
                                                sx={{
                                                    '&:hover, &.active': {
                                                        '.icon svg g': {
                                                            fill: 'var(--vscode-editor-foreground)'
                                                        },
                                                        backgroundColor: 'var(--vscode-pickerGroup-border)',
                                                        border: '1px solid var(--vscode-focusBorder)'
                                                    },
                                                    alignItems: 'center',
                                                    border: '1px solid var(--vscode-editor-foreground)',
                                                    borderRadius: 2,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    height: 20,
                                                    justifyContent: 'left',
                                                    marginBottom: 10,
                                                    padding: 10,
                                                    transition: '0.3s',
                                                    width: 180
                                                }}
                                            >
                                                <IconContainer>
                                                    {getSVGIcon("Aggregate")}
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
                                            </ComponentCard>
                                        ))}
                                    </ButtonGrid>
                                }
                            </div>
                        </>
                    ) : (
                        <>
                            <TitleWrapper>
                                <div style={{ alignSelf: "center" }}>
                                    <Codicon iconSx={{ fontWeight: "bold", fontSize: 13 }} name='arrow-left' onClick={onBackClick} />
                                </div>
                                <h4>All Operations</h4>
                            </TitleWrapper>
                            <ButtonGrid>
                                {(operationsFiltered).map((operation: any) => {
                                    // If operation is hidden, do not render the ComponentCard
                                    if (operation.isHidden) {
                                        return null;
                                    }

                                    return (
                                        <ComponentCard
                                            key={operation}
                                            onClick={() => selectOperation(selectedConnector.operations ? operation : operation.name)}
                                            sx={{
                                                '&:hover, &.active': {
                                                    '.icon svg g': {
                                                        fill: 'var(--vscode-editor-foreground)'
                                                    },
                                                    backgroundColor: 'var(--vscode-pickerGroup-border)',
                                                    border: '1px solid var(--vscode-focusBorder)'
                                                },
                                                alignItems: 'center',
                                                border: '1px solid var(--vscode-editor-foreground)',
                                                borderRadius: 2,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                height: 20,
                                                justifyContent: 'left',
                                                marginBottom: 10,
                                                padding: 10,
                                                transition: '0.3s',
                                                width: 180
                                            }}
                                        >
                                            <IconContainer>
                                                {getSVGIcon("loopback")}
                                            </IconContainer>
                                            <div style={{
                                                width: '100%',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                textAlign: 'left'
                                            }}>
                                                <IconLabel>{selectedConnector.operations ? operation : operation.name}</IconLabel>
                                            </div>
                                        </ComponentCard>
                                    );
                                })}
                            </ButtonGrid>
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
