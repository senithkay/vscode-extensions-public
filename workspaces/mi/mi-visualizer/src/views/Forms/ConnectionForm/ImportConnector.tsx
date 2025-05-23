/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { FormView, FormActions, Button, LocationSelector, ErrorBanner, Typography } from "@wso2-enterprise/ui-toolkit";
import { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { ConnectorStatus } from "@wso2-enterprise/mi-core";
import { POPUP_EVENT_TYPE } from "@wso2-enterprise/mi-core";

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

export interface ImportConnectorFormProps {
    goBack: () => void;
    handlePopupClose?: () => void;
    onImportSuccess: () => void;
    isPopup?: boolean;
}

export function ImportConnectorForm(props: ImportConnectorFormProps) {
    const { rpcClient } = useVisualizerContext();
    const [zipDir, setZipDir] = useState("");
    const [isImporting, setIsImporting] = useState(false);
    const [isFailedImport, setIsFailedImport] = useState(false);
    const connectionStatus = useRef(null);

    useEffect(() => {
        rpcClient.onConnectorStatusUpdate((connectorStatus: ConnectorStatus) => {
            connectionStatus.current = connectorStatus;
        });

    }, []);

    const handleSourceDirSelection = async () => {
        const specDirecrory = await rpcClient.getMiDiagramRpcClient().askFileDirPath();
        setZipDir(specDirecrory.path);
    }

    const importWithZip = async () => {
        setIsImporting(true);
        const response = await rpcClient.getMiDiagramRpcClient().copyConnectorZip({ connectorPath: zipDir });
        try {
            const newConnector: any = await waitForEvent();

            if (newConnector?.isSuccess) {
                rpcClient.getMiVisualizerRpcClient().openView({
                    type: POPUP_EVENT_TYPE.CLOSE_VIEW,
                    location: { view: null, recentIdentifier: "success" },
                    isPopup: true
                });
            } else {
                await removeInvalidConnector(response.connectorPath);
                setIsFailedImport(true);
            }
        } catch (error) {
            console.log(error);
        }

        setIsImporting(false);
    };

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

    const removeInvalidConnector = async (connectorPath: string) => {
        await rpcClient.getMiDiagramRpcClient().removeConnector({ connectorPath: connectorPath });
    }

    const handleCancel = () => {
        if (props.isPopup) {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: POPUP_EVENT_TYPE.CLOSE_VIEW,
                location: { view: null, recentIdentifier: "cancel" },
                isPopup: true
            });
        } else {
            props.goBack();
        }
    }

    return (
        <>
            <FormView title={`Import Connector`} onClose={handleCancel}>
                {isImporting ?
                    (
                        <LoaderWrapper>
                            <ProgressRing />
                            Importing Connector...
                        </LoaderWrapper>
                    ) : (
                        <>
                            {isFailedImport && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                    <Typography variant="body3">Error importing connector. Please try again...</Typography>
                                </div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {zipDir && !zipDir.endsWith('.zip') &&
                                    <ErrorBanner errorMsg={"Invalid file type. Please select a connector zip file"} />
                                }
                                <LocationSelector
                                    label="Choose path to connector Zip"
                                    selectedFile={zipDir}
                                    required
                                    onSelect={handleSourceDirSelection}
                                />
                            </div>
                            <FormActions>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <Button
                                        appearance="primary"
                                        onClick={importWithZip}
                                        disabled={!zipDir || !zipDir.endsWith('.zip')}
                                    >
                                        Import
                                    </Button>
                                </div>
                                <Button
                                    appearance="secondary"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </Button>
                            </FormActions>
                        </>
                    )}
            </FormView >
        </>
    );
}
