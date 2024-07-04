/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ComponentCard, IconLabel, FormView } from "@wso2-enterprise/ui-toolkit";
import { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { ConnectorStatus, MACHINE_VIEW, POPUP_EVENT_TYPE } from "@wso2-enterprise/mi-core";
import AddConnection from "./ConnectionFormGenerator";

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
    width: 50px;

    & img {
        width: 50px;
    }
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

const SampleGrid = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
`;

const SubTitle = styled.div`
    margin-bottom: 10px;
`;

export interface ConnectionStoreProps {
    path: string;
    isPopup?: boolean;
}

export function ConnectorStore(props: ConnectionStoreProps) {
    const { rpcClient } = useVisualizerContext();
    const [localConnectors, setLocalConnectors] = useState<any[]>(undefined);
    const [storeConnectors, setStoreConnectors] = useState<any[]>(undefined);
    const [isGeneratingForm, setIsGeneratingForm] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [selectedConnector, setSelectedConnector] = useState<any>(undefined);
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
            const response = await fetch('https://raw.githubusercontent.com/rosensilva/connectors/main/connectors_list.json');
            const data = await response.json();
            if (data?.data) {
                setStoreConnectors(data.data);
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

    const handleOnClose = () => {
        rpcClient.getMiVisualizerRpcClient().goBack();
    }

    return (
        <>
            {selectedConnector ? (
                <AddConnection
                    allowedConnectionTypes={Object.keys(selectedConnector.connectionUiSchema)}
                    connector={selectedConnector}
                    isPopup={true} />
            ) : (
                <FormView title={`Add New Connection`} onClose={handleOnClose} hideClose={props.isPopup}>
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
                            <div>
                                {(localConnectors === undefined || localConnectors.length === 0) ? (
                                    <></>
                                ) : (
                                    <SampleGrid>
                                        {localConnectors.map((connector: any) => (
                                            <ComponentCard
                                                key={connector.name}
                                                onClick={() => selectConnector(connector)}
                                                disabled={Object.keys(connector.connectionUiSchema) &&
                                                    Object.keys(connector.connectionUiSchema).length === 0}
                                                sx={{
                                                    alignItems: 'center',
                                                    border: '1px solid var(--vscode-editor-foreground)',
                                                    borderRadius: 2,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    justifyContent: 'left',
                                                    marginBottom: 10,
                                                    padding: 10,
                                                    transition: '0.3s',
                                                    width: '88px',
                                                    height: '88px'
                                                }}
                                            >
                                                <CardContent>
                                                    <CardLabel>
                                                        <div style={{
                                                            width: '100%',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            textAlign: 'center',
                                                            paddingBottom: '10px'
                                                        }}>
                                                            <IconLabel>
                                                                {connector.name}
                                                            </IconLabel>
                                                            <VersionTag>
                                                                {connector.version}
                                                            </VersionTag>
                                                        </div>
                                                    </CardLabel>
                                                    <IconContainer>
                                                        <img
                                                            src={connector.iconPathUri.uri}
                                                            alt="Icon"
                                                        />
                                                    </IconContainer>
                                                </CardContent>
                                            </ComponentCard>
                                        ))}
                                    </SampleGrid>
                                )}
                            </div>
                            <div>
                                {(storeConnectors === undefined || localConnectors === undefined) ? (
                                    <LoaderWrapper>
                                        <ProgressRing />
                                        Loading connectors...
                                    </LoaderWrapper>
                                ) : storeConnectors.length === 0 ? (
                                    <LoaderWrapper>
                                        Error loading connectors. Please retry...
                                    </LoaderWrapper>
                                ) : (
                                    <SampleGrid>
                                        {storeConnectors.sort((a: any, b: any) => a.rank - b.rank).map((connector: any) => (
                                            localConnectors.some(c => c.name === connector.name) ? null : (
                                                <ComponentCard
                                                    key={connector.name}
                                                    onClick={() => selectStoreConnector(connector)}
                                                    sx={{
                                                        alignItems: 'center',
                                                        border: '1px solid var(--vscode-editor-foreground)',
                                                        borderRadius: 2,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        justifyContent: 'left',
                                                        marginBottom: 10,
                                                        padding: 10,
                                                        transition: '0.3s',
                                                        width: '88px',
                                                        height: '88px'
                                                    }}
                                                >
                                                    <CardContent>
                                                        <CardLabel>

                                                            <div style={{
                                                                width: '100%',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                                textAlign: 'center',
                                                                paddingBottom: '10px'
                                                            }}>
                                                                <IconLabel>
                                                                    {connector.name}
                                                                </IconLabel>
                                                                <VersionTag>
                                                                    {connector.version}
                                                                </VersionTag>
                                                            </div>
                                                        </CardLabel>
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
                                                    </CardContent>
                                                </ComponentCard>
                                            )
                                        ))}
                                    </SampleGrid>
                                )}
                            </div>
                        </>
                    )}
                </FormView>
            )}

        </>
    );
}