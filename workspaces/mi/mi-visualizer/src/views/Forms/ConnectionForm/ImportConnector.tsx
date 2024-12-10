/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { FormView, FormActions, Button, LocationSelector } from "@wso2-enterprise/ui-toolkit";
import { useRef, useState } from "react";
import styled from "@emotion/styled";
import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { getAPIDirectory } from "@wso2-enterprise/mi-core";

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
}

export function ImportConnectorForm(props: ImportConnectorFormProps) {
    const { rpcClient } = useVisualizerContext();
    const [sourceDir, setSourceDir] = useState("");
    const [isImporting, setIsImporting] = useState(false);
    const [importOpenAPI, setImportOpenAPI] = useState(true);
    const connectionStatus = useRef(null);

    const handleSourceDirSelection = async () => {
        const specDirecrory = await rpcClient.getMiDiagramRpcClient().askFileDirPath();
        setSourceDir(specDirecrory.path);
    }

    const importWithOpenAPI = async () => {
        setIsImporting(true);
        await rpcClient.getMiVisualizerRpcClient().importOpenAPISpec();
        setIsImporting(false);
        props.onImportSuccess();
    };

    const importWithZip = async () => {
        setIsImporting(true);
        await rpcClient.getMiDiagramRpcClient().copyConnectorZip({ connectorPath: sourceDir });
        try {
            await waitForEvent();
        } catch (error) {
            console.log(error);
        }

        setIsImporting(false);
        props.onImportSuccess();
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

    const handleCancel = () => {
        props.goBack();
    }

    const handleOnClose = () => {
        rpcClient.getMiVisualizerRpcClient().goBack();
    }

    return (
        <>
            <FormView title={`Import Connector`} onClose={props.handlePopupClose ?? handleOnClose}>
                <span>Please select an method to import a connector.</span>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '80px', margin: '0px 0px 20px 0' }}>
                    <label>
                        <input
                            type="radio"
                            name="importMethod"
                            value="openAPI"
                            checked={importOpenAPI}
                            onChange={() => {
                                setImportOpenAPI(true);
                                setSourceDir("");
                            }}
                        />
                        Import Using OpenAPI
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="importMethod"
                            value="zip"
                            checked={!importOpenAPI}
                            onChange={() => {
                                setImportOpenAPI(false);
                                setSourceDir("");
                            }}
                        />
                        Upload Connector ZIP file
                    </label>
                </div>
                {isImporting ?
                    (
                        <LoaderWrapper>
                            <ProgressRing />
                            Importing Connector...
                        </LoaderWrapper>
                    ) : (
                        <>
                            {!importOpenAPI && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <LocationSelector
                                        label="Choose path to connector Zip"
                                        selectedFile={sourceDir}
                                        required
                                        onSelect={handleSourceDirSelection}
                                    />
                                </div>
                            )}
                            <FormActions>
                                {importOpenAPI ? (
                                    <Button
                                        appearance="primary"
                                        onClick={importWithOpenAPI}
                                    >
                                        Upload OpenAPI Spec
                                    </Button>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <Button
                                            appearance="primary"
                                            onClick={importWithZip}
                                            disabled={!sourceDir}
                                        >
                                            Import
                                        </Button>
                                    </div>
                                )}
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
