/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ComponentCard, IconLabel, FormView, TextField, Codicon } from "@wso2-enterprise/ui-toolkit";
import { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { ConnectorStatus, MACHINE_VIEW, POPUP_EVENT_TYPE } from "@wso2-enterprise/mi-core";
import AddConnection from "./ConnectionFormGenerator";
import { APIS } from "../../../constants";

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
        width: 40px;
    }
`;

const VersionTag = styled.div`
    font-size: 13px;
    padding-left: 2px;
    text-align: start;
`;

const CardContent = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 10px;
`;

const CardLabel = styled.div`
    display: flex;
    flex-direction: row;
    align-self: flex-start;
    width: 100%;
`;

const SampleGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(176px, 1fr));
    gap: 20px;
`;

const SearchStyle = {
    width: 'auto',

    '& > vscode-text-field': {
        width: '100%',
        height: '40px',
        borderRadius: '5px',
    },
};

const NameLabel = styled(IconLabel)`
    text-align: start;
    font-size: 1.2em;
`;

export interface ConnectionStoreProps {
    path: string;
    isPopup?: boolean;
    handlePopupClose?: () => void;
}

const searchIcon = (<Codicon name="search" sx={{ cursor: "auto" }} />);

export function ConnectorStore(props: ConnectionStoreProps) {
    const { rpcClient } = useVisualizerContext();
    const [localConnectors, setLocalConnectors] = useState<any[]>(undefined);
    const [storeConnectors, setStoreConnectors] = useState<any[]>(undefined);
    const [isGeneratingForm, setIsGeneratingForm] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [selectedConnector, setSelectedConnector] = useState<any>(undefined);
    const [searchValue, setSearchValue] = useState<string>('');
    const [filteredLocalConnectors, setFilteredLocalConnectors] = useState<any[]>([]);
    const [filteredStoreConnectors, setFilteredStoreConnectors] = useState<any[]>([]);
    const connectionStatus = useRef(null);

    const fetchLocalConnectorData = async () => {
        const connectorData = await rpcClient.getMiDiagramRpcClient().getAvailableConnectors({ documentUri: props.path, connectorName: "" });
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

    const fetchStoreConnectors = async () => {
        try {
            const response = await fetch(APIS.CONNECTOR);
            const data = await response.json();
            if (data) {
                setStoreConnectors(data['outbound-connector-data']);
            } else {
                setStoreConnectors([]);
            }
        } catch (e) {
            console.error("Error fetching connectors", e);
        }
    };

    useEffect(() => {

        rpcClient?.onConnectorStatusUpdate((connectorStatus: ConnectorStatus) => {
            connectionStatus.current = connectorStatus;
        });

        fetchLocalConnectorData();
        fetchStoreConnectors();
    }, []);

    useEffect(() => {
        if (localConnectors && storeConnectors) {
            setFilteredLocalConnectors(searchConnectors(localConnectors));
            setFilteredStoreConnectors(searchConnectors(storeConnectors));
        }
    }, [searchValue]);

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

    const searchConnectors = (connectors: any[]) => {
        return connectors?.filter(connector => connector.name.toLowerCase().includes(searchValue.toLowerCase()));
    }


    const selectConnector = async (connector: any) => {
        setSelectedConnector(connector);
    }

    const selectStoreConnector = async (connector: any) => {
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
                    // Get Connector Data from LS
                    const connectorData = await rpcClient.getMiDiagramRpcClient().getAvailableConnectors({
                        documentUri: props.path,
                        connectorName: connector.name.toLowerCase().replace(/\s/g, '')
                    });


                    if (connectorData) {
                        selectConnector(connectorData);
                    } else {
                        fetchLocalConnectorData();
                    }
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
    }

    const findAllowedConnectionTypes = (elements: any[]): string[] | undefined => {
        for (let element of elements) {
            if (element.type === 'attribute' && element.value.inputType === 'connection') {
                return element.value.allowedConnectionTypes;
            }
            if (element.type === 'attributeGroup') {
                const result: any[] = findAllowedConnectionTypes(element.value.elements);
                if (result) return result;
            }
        }
    };

    const handleSearch = (e: string) => {
        setSearchValue(e);
    }

    function capitalizeFirstChar(name: string) {
        if (!name) return '';
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    function existsInLocalConnectors(connector: any) {
        return localConnectors?.some(localConnector =>
            localConnector.name.toLowerCase() === connector.name.toLowerCase().replace(/\s/g, '') && localConnector.version === connector.version);
    }

    const changeConnector = () => {
        setSelectedConnector(undefined);
    }

    const handleOnClose = () => {
        rpcClient.getMiVisualizerRpcClient().goBack();
    }

    const ConnectorList = () => {
        let displayedLocalConnectors = localConnectors;
        let displayedStoreConnectors = storeConnectors;

        if (searchValue) {
            displayedLocalConnectors = filteredLocalConnectors;
            displayedStoreConnectors = filteredStoreConnectors;
        }

        return (
            <div>
                {(displayedLocalConnectors === undefined && displayedStoreConnectors === undefined) ? (
                    <LoaderWrapper>
                        <ProgressRing />
                        Loading connectors...
                    </LoaderWrapper>
                ) : storeConnectors && storeConnectors.length === 0 ? (
                    <LoaderWrapper>
                        Error loading connectors. Please retry...
                    </LoaderWrapper>
                ) : (
                    <SampleGrid>
                        {displayedLocalConnectors && displayedLocalConnectors.map((connector: any) => (
                            <ComponentCard
                                key={connector.name}
                                onClick={() => selectConnector(connector)}
                                sx={{
                                    border: '1px solid var(--vscode-dropdown-border)',
                                    backgroundColor: 'var(--vscode-dropdown-background)',
                                    padding: '10px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'left',
                                    borderRadius: 1,
                                    transition: '0.3s',
                                    width: '176px',
                                    height: '40px',
                                    '&:hover': {
                                        backgroundColor: 'var(--vscode-button-background)'
                                    },
                                    fontSize: '15px'
                                }}
                            >
                                <CardContent>
                                    <IconContainer>
                                        <img
                                            src={connector.iconPathUri.uri}
                                            alt="Icon"
                                        />
                                    </IconContainer>
                                    <CardLabel>
                                        <div style={{
                                            width: '140px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            textAlign: 'center',
                                            paddingBottom: '10px'
                                        }}>
                                            <NameLabel>
                                                {capitalizeFirstChar(connector.name)}
                                            </NameLabel>
                                            <VersionTag>
                                                {connector.version}
                                            </VersionTag>
                                        </div>
                                    </CardLabel>
                                </CardContent>
                            </ComponentCard>
                        ))}
                        {displayedStoreConnectors && displayedLocalConnectors &&
                            displayedStoreConnectors.sort((a: any, b: any) => a.rank - b.rank).map((connector: any) => (
                                displayedLocalConnectors.some(c => (c.name === connector.name) &&
                                    (c.version === connector.version)) ? null : (
                                    <ComponentCard
                                        key={connector.name}
                                        onClick={() => selectStoreConnector(connector)}
                                        sx={{
                                            border: '1px solid var(--vscode-dropdown-border)',
                                            backgroundColor: 'var(--vscode-dropdown-background)',
                                            padding: '10px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'left',
                                            borderRadius: 1,
                                            transition: '0.3s',
                                            width: '176px',
                                            height: '40px',
                                            '&:hover': {
                                                backgroundColor: 'var(--vscode-button-background)'
                                            },
                                            fontSize: '15px'
                                        }}
                                    >
                                        <CardContent>
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
                                            <CardLabel>
                                                <div style={{
                                                    width: '140px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    textAlign: 'center',
                                                    paddingBottom: '10px'
                                                }}>
                                                    <NameLabel>
                                                        {capitalizeFirstChar(connector.name)}
                                                    </NameLabel>
                                                    <VersionTag>
                                                        {connector.version}
                                                    </VersionTag>
                                                </div>
                                            </CardLabel>
                                        </CardContent>
                                    </ComponentCard>
                                )
                            ))}
                    </SampleGrid>
                )}
            </div>
        );
    }

    return (
        <>
            {selectedConnector ? (
                <AddConnection
                    allowedConnectionTypes={Object.keys(selectedConnector.connectionUiSchema)}
                    connector={selectedConnector}
                    isPopup={props.isPopup}
                    changeConnector={changeConnector}
                    path={props.path}
                    handlePopupClose={props.handlePopupClose}
                />
            ) : (
                <FormView title={`Add New Connection`} onClose={props.handlePopupClose ?? handleOnClose} hideClose={props.isPopup}>
                    <span>Please select a connector to create a connection.</span>
                    {isGeneratingForm ? (
                        <LoaderWrapper>
                            <ProgressRing />
                            Generating options...
                        </LoaderWrapper>
                    ) : isDownloading ? (
                        <LoaderWrapper>
                            <ProgressRing />
                            Downloading connector...
                        </LoaderWrapper>
                    ) : (
                        <>
                            {/* Search bar */}
                            <TextField
                                sx={SearchStyle}
                                placeholder="Search"
                                value={searchValue}
                                onTextChange={handleSearch}
                                icon={{
                                    iconComponent: searchIcon,
                                    position: 'start',
                                }}
                                autoFocus={true}
                            />
                            <ConnectorList />
                        </>
                    )}
                </FormView >
            )}
        </>
    );
}
