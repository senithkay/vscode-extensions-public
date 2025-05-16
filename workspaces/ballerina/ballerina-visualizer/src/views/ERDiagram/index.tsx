/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { PersistERModel, VisualizerLocation } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { PersistDiagram } from "@wso2-enterprise/persist-layer-diagram";
import { Button, Icon, View, ViewContent } from "@wso2-enterprise/ui-toolkit";
import { TopNavigationBar } from "../../components/TopNavigationBar";
import { TitleBar } from "../../components/TitleBar";
import styled from "@emotion/styled";

const ActionButton = styled(Button)`
    display: flex;
    align-items: center;
    gap: 4px;
`;

export function ERDiagram() {
    const { rpcClient } = useRpcContext();
    const persistDiagramRPCClient = rpcClient.getPersistDiagramRpcClient();
    const [visualizerLocation, setVisualizerLocation] = React.useState<VisualizerLocation>();
    const [collapsedMode, setIsCollapsedMode] = useState<boolean>(false);

    useEffect(() => {
        if (rpcClient) {
            rpcClient.getVisualizerLocation().then((value) => {
                setVisualizerLocation(value);
            });
        }
    }, [rpcClient]);

    const getPersistModel = async () => {
        if (!rpcClient) {
            return;
        }
        const response: PersistERModel = await persistDiagramRPCClient.getPersistERModel();
        return response;
    };

    const showProblemPanel = async () => {
        if (!rpcClient) {
            return;
        }
        await persistDiagramRPCClient.showProblemPanel();
    };
    
    return (
        <View>
            <TopNavigationBar />
            <TitleBar
                title="Entity Relationship Diagram"
                actions={
                    <>
                        <ActionButton
                            onClick={() => setIsCollapsedMode(!collapsedMode)}
                            appearance="secondary" 
                        >
                            {collapsedMode ? (
                                <Icon name="unfold-more" sx={{ marginRight: "5px", width: 16, height: 16, fontSize: 14 }} />
                            ) : (
                                <Icon name="unfold-less" sx={{ marginRight: "5px", width: 16, height: 16, fontSize: 14 }} />
                            )}
                            {collapsedMode ? "Expand" : "Collapse"}
                        </ActionButton>
                    </>
                }
            />
            <ViewContent>
                <PersistDiagram
                    getPersistModel={getPersistModel}
                    selectedRecordName={visualizerLocation?.identifier}
                    showProblemPanel={showProblemPanel}
                    collapsedMode={collapsedMode}
                />
            </ViewContent>
        </View>
    );
}
