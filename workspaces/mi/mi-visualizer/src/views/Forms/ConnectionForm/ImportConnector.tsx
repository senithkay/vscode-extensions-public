/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { FormView, FormActions, Button, LocationSelector } from "@wso2-enterprise/ui-toolkit";
import { useState } from "react";
import styled from "@emotion/styled";
import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";

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

    const handleSourceDirSelection = async () => {
        const specDirecrory = await rpcClient.getMiDiagramRpcClient().askFileDirPath();
        setSourceDir(specDirecrory.path);
    }

    const importConnector = async () => {
        setIsImporting(true);
        await new Promise(resolve => setTimeout(resolve, 5000));
        setIsImporting(false);
        props.onImportSuccess();
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
                <span>Please select an openAPI specification to import a connector.</span>
                {isImporting ?
                    (
                        <LoaderWrapper>
                            <ProgressRing />
                            Importing Connector...
                        </LoaderWrapper>
                    ) : (
                        <>
                            <div style={{ margin: '20px 0px' }}>
                                <LocationSelector
                                    label="OpenAPI Specification File Path"
                                    selectedFile={sourceDir}
                                    required
                                    onSelect={handleSourceDirSelection}
                                />
                            </div>
                            <FormActions>
                                <Button
                                    appearance="secondary"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    appearance="primary"
                                    onClick={importConnector}
                                    disabled={!sourceDir}
                                >
                                    Create
                                </Button>
                            </FormActions>
                        </>
                    )
                }
            </FormView >
        </>
    );
}
