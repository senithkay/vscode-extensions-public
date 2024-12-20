/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { FormView, Card } from "@wso2-enterprise/ui-toolkit";
import { EVENT_TYPE, MACHINE_VIEW, DownloadProgressData } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import AddInboundConnector from "./inboundConnectorForm";
import { APIS } from "../../../constants";
import { VSCodeLink, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import { InboundEndpoint } from "@wso2-enterprise/mi-syntax-tree/lib/src";

const SampleGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(176px, 1fr));
    gap: 20px;
`;

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

export interface Region {
    label: string;
    value: string;
}

export interface InboundEPWizardProps {
    path: string;
    model?: InboundEndpoint;
}

export function InboundEPWizard(props: InboundEPWizardProps) {

    const { rpcClient } = useVisualizerContext();
    const [connectors, setConnectors] = useState(undefined);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isFetchingConnectors, setIsFetchingConnectors] = useState(false);
    const [connectorSchema, setConnectorSchema] = useState(undefined);
    const [downloadProgress, setDownloadProgress] = useState<DownloadProgressData>(undefined);

    useEffect(() => {
        (async () => {
            if (props.model) {
                const response = await rpcClient.getMiDiagramRpcClient().getInboundEPUischema({
                    documentPath: props.path
                });

                if (response?.uiSchema) {
                    setConnectorSchema(response?.uiSchema);
                } else {
                    openSourceView();
                }
            } else {
                setConnectorSchema(undefined);
                fetchConnectors();
            }
        })();
    }, [props.path]);

    rpcClient.onDownloadProgress((data: DownloadProgressData) => {
        setDownloadProgress(data);
    });

    const fetchConnectors = async () => {
        setIsFetchingConnectors(true);
        try {
            const response = rpcClient.getMiDiagramRpcClient().getStoreConnectorJSON();
            const data = (await response).inboundConnectors;
            setConnectors(data)
        } catch (e) {
            console.error("Error fetching connectors", e);
        }
        setIsFetchingConnectors(false);
    };

    const formTitle = !props.model
        ? "Create new Listener"
        : "Edit Listener : " + props.path.replace(/^.*[\\/]/, '').split(".")[0];


    const transformParams = (params: any, reverse: boolean = false) => {
        const s = reverse ? '-' : '.';
        const j = reverse ? '.' : '-';
        const parameters: { [key: string]: any } = {}
        for (const prop in params) {
            parameters[prop.split(s).join(j)] = params[prop];
        }
        if ("rabbitmq-server-host-name" in parameters && !("rabbitmq-exchange-autodeclare" in parameters)) {
            parameters["rabbitmq-exchange-autodeclare"] = true;
        }
        if ("rabbitmq-server-host-name" in parameters && !("rabbitmq-queue-autodeclare" in parameters)) {
            parameters["rabbitmq-queue-autodeclare"] = true;
        }
        return parameters;
    }

    const selectConnector = async (connector: any) => {
        // Check if uiSchema is available
        const response = await rpcClient.getMiDiagramRpcClient().getInboundEPUischema({
            connectorName: connector.name
        });

        if (response?.uiSchema) {
            setConnectorSchema(response?.uiSchema);
        } else {
            // Download connector from store
            setIsDownloading(true);
            let downloadSuccess = false;
            let attempts = 0;
            let uischema;

            while (!downloadSuccess && attempts < 3) {
                try {
                    uischema = await rpcClient.getMiDiagramRpcClient().downloadInboundConnector({
                        url: connector.download_url
                    });
                    await rpcClient.getMiDiagramRpcClient().saveInboundEPUischema({
                        connectorName: uischema.uischema.name,
                        uiSchema: JSON.stringify(uischema.uischema)
                    })
                    setConnectorSchema(uischema?.uischema);
                    downloadSuccess = true;
                } catch (error) {
                    console.error('Error occurred while downloading connector:', error);
                    attempts++;
                }
            }
            setIsDownloading(false);
        }
    }

    const handleCreateInboundEP = async (values: any) => {
        const createInboundEPParams = {
            directory: props.path,
            ...values,
            type: values.type?.toLowerCase(),
            parameters: {
                ...transformParams(values.parameters, true)
            }
        }
        const response = await rpcClient.getMiDiagramRpcClient().createInboundEndpoint(createInboundEPParams);
        if (response.path) {
            openSequence(response.path);
        } else {
            openOverview();
        }
    };

    const changeType = (type: string) => {
        setConnectorSchema(undefined);
    }

    const openSourceView = () => {
        rpcClient.getMiDiagramRpcClient().closeWebView();
        rpcClient.getMiDiagramRpcClient().openFile({ path: props.path });
    };

    const openOverview = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const openSequence = (sequencePath: string) => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.InboundEPView, documentUri: sequencePath } });
    };

    const handleOnClose = () => {
        rpcClient.getMiVisualizerRpcClient().goBack();
    }

    return (
        <FormView title={formTitle} onClose={handleOnClose}>
            {connectorSchema ? (
                <AddInboundConnector formData={connectorSchema} path={props.path} setType={changeType}
                    handleCreateInboundEP={handleCreateInboundEP} model={props?.model} />
            ) : (
                !props.model && (
                    isDownloading ? (
                        <LoaderWrapper>
                            <ProgressRing />
                            <span>Downloading connector... This might take a while</span>
                            {downloadProgress && (
                                `Downloaded ${downloadProgress.downloadedAmount} of ${downloadProgress.downloadSize} (${downloadProgress.percentage}%). `
                            )}
                        </LoaderWrapper>
                    ) : (
                        <>
                            <span>Please select an inbound endpoint.</span>
                            <SampleGrid>
                                {connectors ?
                                    connectors.sort((a: any, b: any) => a.rank - b.rank).map((connector: any) => (
                                        <Card
                                            key={connector.name}
                                            icon="inbound-endpoint"
                                            title={connector.name}
                                            description={connector.description}
                                            onClick={() => selectConnector(connector)}
                                        />
                                    )) : (
                                        isFetchingConnectors ? (
                                            <LoaderWrapper>
                                                <ProgressRing />
                                                Fetching connectors...
                                            </LoaderWrapper>
                                        ) : (
                                            <LoaderWrapper>
                                                <span>
                                                    Failed to fetch store connectors. Please <VSCodeLink onClick={fetchConnectors}>retry</VSCodeLink>
                                                </span>
                                            </LoaderWrapper>
                                        )
                                    )}
                            </SampleGrid>
                        </>
                    )
                )
            )}
        </FormView>
    );
}
