/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/

import React from 'react';
import { Button, FormActions, Typography } from '@wso2-enterprise/ui-toolkit';
import { VSCodeProgressRing } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import SidePanelContext from '../SidePanelContexProvider';
import { sidepanelGoBack } from '..';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';

const ProgressRing = styled(VSCodeProgressRing)`
    height: 50px;
    width: 50px;
    margin-top: 25px;
    margin-bottom: 10px;
`;

interface DownloadPageProps {
    module: any;
    onDownloadSuccess: (connectorName: string) => void;
}

export function DownloadPage(props: DownloadPageProps) {
    const { module, onDownloadSuccess } = props;
    const sidePanelContext = React.useContext(SidePanelContext);
    const { rpcClient } = useVisualizerContext();
    const [isDownloading, setIsDownloading] = React.useState(false);
    const [isFailedDownload, setIsFailedDownload] = React.useState(false);

    const handleDependencyResponse = async (response: boolean) => {
        if (response) {
            
            setIsDownloading(true);
        
            const updateDependencies = async () => {
                const dependencies = [];
                dependencies.push({
                    groupId: module.mavenGroupId,
                    artifact: module.mavenArtifactId,
                    version: module.version.tagName,
                    type: 'zip' as 'zip'
                });
                await rpcClient.getMiVisualizerRpcClient().updateDependencies({
                    dependencies
                });
            }

            await updateDependencies();

            // Download Connector
            const response = await rpcClient.getMiVisualizerRpcClient().updateConnectorDependencies();

            if (response === "Success") {
                onDownloadSuccess(props.module.connectorName);
                setIsDownloading(false);
                sidepanelGoBack(sidePanelContext);
            } else {
                setIsFailedDownload(true);
                setIsDownloading(false);
            }


        } else {
            sidepanelGoBack(sidePanelContext);
        }
    }

    const retryDownload = async () => {
        setIsFailedDownload(true);
        // Download Connector
        const response = await rpcClient.getMiVisualizerRpcClient().updateConnectorDependencies();

        if (response === "Success") {
            onDownloadSuccess(props.module.connectorName);
            setIsDownloading(false);
            sidepanelGoBack(sidePanelContext, 2);
        } else {
            setIsFailedDownload(true);
            setIsDownloading(false);
        }
    }

    return (
        <>
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3"></Typography>
            <div>
                {isDownloading ? (
                    <div style={{ display: "flex", flexDirection: "column", padding: "10px", alignItems: "center", gap: "10px" }}>
                        <ProgressRing sx={{ height: '50px', width: '50px' }} />
                        <span>Downloading Module...</span>
                    </div>
                ) : isFailedDownload ? (
                    <div style={{ display: "flex", flexDirection: "column", padding: "40px", gap: "15px" }}>
                        <Typography variant="body2">Error downloading module. Please try again...</Typography>
                        <FormActions>
                            <Button
                                appearance="primary"
                                onClick={() => retryDownload()}
                            >
                                Retry
                            </Button>
                            <Button
                                appearance="secondary"
                                onClick={() => handleDependencyResponse(false)}
                            >
                                Cancel
                            </Button>
                        </FormActions>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", padding: "40px", gap: "15px" }}>
                        <Typography variant="body2">Dependencies will be added to the project. Do you want to continue?</Typography>
                        <FormActions>
                            <Button
                                appearance="secondary"
                                onClick={() => handleDependencyResponse(false)}
                            >
                                No
                            </Button>
                            <Button
                                appearance="primary"
                                onClick={() => handleDependencyResponse(true)}
                            >
                                Yes
                            </Button>
                        </FormActions>
                    </div>
                )}
            </div>
        </>
    );
};
