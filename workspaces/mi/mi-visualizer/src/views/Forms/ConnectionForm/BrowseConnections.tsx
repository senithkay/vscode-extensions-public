/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ComponentCard, IconLabel, FormView, TextField, Codicon, Typography, FormActions, Button } from "@wso2-enterprise/ui-toolkit";
import { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { VSCodeLink, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { ConnectorStatus } from "@wso2-enterprise/mi-core";
import AddConnection from "./ConnectionFormGenerator";
import { connectorFailoverIconUrl } from "../../../constants";

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

const LabelContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
    padding-bottom: 10px;
`;

const SampleGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
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

const connectorCardStyle = {
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
};

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
    const [isFetchingStoreConnectors, setIsFetchingStoreConnectors] = useState(false);
    const [isGeneratingForm, setIsGeneratingForm] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [conOnconfirmation, setConOnconfirmation] = useState(undefined);
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
        setIsFetchingStoreConnectors(true);
        try {
            // const response = await rpcClient.getMiDiagramRpcClient().getStoreConnectorJSON();
            // const data = response.outboundConnectors;

            const data = [
                {
                    "connectorName": "Redis",
                    "description": "The Redis connector allows you to access the Redis commands through the WSO2 EI. Redis is an open source (BSD licensed), in-memory data structure store, used as a database, cache and message broker. It supports data structures such as strings, hashes, lists, sets, sorted sets with range queries, bitmaps, hyperloglogs and geospatial indexes with radius queries.\nIn latest version we have added following:\nPreviously we were creating a single pool for each cluster operation and closing it after each operation that's why read/write lock issue occurs (jmxRegister and jmxUnRegister on the same object). This Pr rectifies that and also avoids closing JedisCluster after each operation since It's no need to close the JedisCluster instance as it is handled by the JedisClusterConnectionPool itself.\n\nAlso introduced the \"isJmxEnabled\" property to enable JMX if required.",
                    "mavenGroupId": "org.wso2.carbon.connector",
                    "mavenArtifactId": "org.wso2.carbon.connector.redis",
                    "version": {
                        "tagName": "3.1.3",
                        "releaseId": "176616995",
                        "isLatest": true,
                        "isDeprecated": false,
                        "operations": [
                            {
                                "name": "init",
                                "description": "configure Redis connector",
                                "isHidden": false
                            },
                            {
                                "name": "echo",
                                "description": "echo the given string",
                                "isHidden": false
                            }
                        ]
                    },
                    "otherVersions": {
                        "3.0.0": "158539115",
                        "3.1.0": "159113274",
                        "3.1.1": "176263727",
                        "3.1.2": "176288410",
                        "2.1.0": "33548116",
                        "2.2.0": "45003675",
                        "2.3.0": "48791514",
                        "2.4.0": "65373888",
                        "2.5.0": "85390009",
                        "2.6.0": "96810611",
                        "2.7.0": "98802216"
                    },
                    "connectorRank": 5,
                    "iconUrl": "https://mi-connectors.wso2.com/icons/redis.gif"
                }
            ];

            if (data) {
                setStoreConnectors(data);
            } else {
                setStoreConnectors(null);
            }
        } catch (e) {
            setStoreConnectors(null);
            console.error("Error fetching connectors", e);
        }
        setIsFetchingStoreConnectors(false);
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
            // setFilteredStoreConnectors(searchConnectors(storeConnectors));
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
        setConOnconfirmation(connector);
    }

    // const downloadStoreConnector = async (connector: any) => {
    //     setIsDownloading(true);
    //     let downloadSuccess = false;
    //     let attempts = 0;

    //     while (!downloadSuccess && attempts < 3) {
    //         try {
    //             await rpcClient.getMiDiagramRpcClient().downloadConnector({
    //                 url: connector.download_url
    //             });
    //             downloadSuccess = true;
    //         } catch (error) {
    //             console.error('Error occurred while downloading connector:', error);
    //             attempts++;
    //         }
    //     }

        // if (downloadSuccess) {
        //     try {
        //         const status: any = await waitForEvent();

        //         if (status.connector === connector.name && status.isSuccess) {
        //             // Get Connector Data from LS
        //             const connectorData = await rpcClient.getMiDiagramRpcClient().getAvailableConnectors({
        //                 documentUri: props.path,
        //                 connectorName: connector.name.toLowerCase().replace(/\s/g, '')
        //             });


        //             if (connectorData) {
        //                 selectConnector(connectorData);
        //             } else {
        //                 fetchLocalConnectorData();
        //             }
        //         } else {
        //             fetchLocalConnectorData();
        //             console.log(status.message);
        //         }
        //     } catch (error) {
        //         console.log(error);
        //     }
        // } else {
        //     console.error('Failed to download connector after 3 attempts');
        // }
    //     await new Promise(resolve => setTimeout(resolve, 5000));
    //     setIsDownloading(false);
    // }

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

    // function existsInLocalConnectors(connector: any) {
    //     return localConnectors?.some(localConnector =>
    //         localConnector.name.toLowerCase() === connector.name.toLowerCase().replace(/\s/g, '') && localConnector.version === connector.version);
    // }

    const changeConnector = () => {
        setSelectedConnector(undefined);
    }

    const handleDependencyResponse = async (response: boolean) => {
        if (response) {
            // Logic to add dependencies for Redis module
            setIsDownloading(true);
            await new Promise(resolve => setTimeout(resolve, 5000));
            setConOnconfirmation(undefined);
            setIsDownloading(false);
        } else {
            setConOnconfirmation(undefined);
        }
    }

    const handleOnClose = () => {
        rpcClient.getMiVisualizerRpcClient().goBack();
    }

    const ConnectorList = () => {
        let displayedLocalConnectors = localConnectors;
        let displayedStoreConnectors = storeConnectors;

        if (searchValue) {
            displayedLocalConnectors = filteredLocalConnectors;
            // displayedStoreConnectors = filteredStoreConnectors;
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
                    <>
                        <SampleGrid>
                            {displayedLocalConnectors && displayedLocalConnectors.map((connector: any) => (
                                <ComponentCard
                                    key={connector.name}
                                    onClick={() => selectConnector(connector)}
                                    sx={connectorCardStyle}
                                >
                                    <CardContent>
                                        <IconContainer>
                                            <img
                                                src={connector.iconPathUri.uri}
                                                alt="Icon"
                                            />
                                        </IconContainer>
                                        <CardLabel>
                                            <LabelContainer>
                                                <NameLabel>
                                                    {capitalizeFirstChar(connector.name)}
                                                </NameLabel>
                                                <VersionTag>
                                                    {connector.version}
                                                </VersionTag>
                                            </LabelContainer>
                                        </CardLabel>
                                    </CardContent>
                                </ComponentCard>
                            ))}
                            {displayedStoreConnectors && displayedLocalConnectors &&
                                displayedStoreConnectors.sort((a: any, b: any) => a.connectorRank - b.connectorRanke).map((connector: any) => (
                                    displayedLocalConnectors.some(c => (c.connectorName === connector.name) &&
                                        (c.version.tagName === connector.version)) ? null : (
                                        <ComponentCard
                                            key={connector.connectorName}
                                            onClick={() => selectStoreConnector(connector)}
                                            sx={connectorCardStyle}
                                        >
                                            <CardContent>
                                                <IconContainer>
                                                    <img
                                                        src={connector.iconUrl}
                                                        alt="Icon"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = connectorFailoverIconUrl
                                                        }}
                                                    />
                                                </IconContainer>
                                                <CardLabel>
                                                    <LabelContainer>
                                                        <NameLabel>
                                                            {capitalizeFirstChar(connector.connectorName)}
                                                        </NameLabel>
                                                        <VersionTag>
                                                            {connector.version.tagName}
                                                        </VersionTag>
                                                    </LabelContainer>
                                                </CardLabel>
                                            </CardContent>
                                        </ComponentCard>
                                    )
                                ))}
                        </SampleGrid>
                        {displayedStoreConnectors === undefined ? (
                            <LoaderWrapper>
                                <ProgressRing />
                                Fetching Connectors...
                            </LoaderWrapper>
                        ) : displayedStoreConnectors === null && (
                            <LoaderWrapper>
                                {isFetchingStoreConnectors ? (
                                    <span>Fetching connectors...</span>
                                ) : (
                                    <span>Failed to fetch store connectors. Please <VSCodeLink onClick={fetchStoreConnectors}>retry</VSCodeLink></span>

                                )}
                            </LoaderWrapper>
                        )}
                    </>
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
                <FormView title={`Add New Connection`} onClose={props.handlePopupClose ?? handleOnClose}>
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
                    ) : conOnconfirmation ? (
                        <div style={{ display: "flex", flexDirection: "column", padding: "40px", gap: "15px" }}>
                            <Typography variant="body2">Dependencies will be added to the project. Do you want to continue?</Typography>
                            <FormActions>
                                <Button
                                    appearance="primary"
                                    onClick={() => handleDependencyResponse(true)}
                                >
                                    Yes
                                </Button>
                                <Button
                                    appearance="secondary"
                                    onClick={() => handleDependencyResponse(false)}
                                >
                                    No
                                </Button>
                            </FormActions>
                        </div>
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
