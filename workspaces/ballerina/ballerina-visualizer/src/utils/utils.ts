/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { VisualizerLocation } from "@wso2-enterprise/ballerina-core";
import { BallerinaRpcClient } from "@wso2-enterprise/ballerina-rpc-client";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

export function transformNodePosition(position: NodePosition) {
    return {
        start: {
            line: position.startLine,
            character: position.startColumn
        },
        end: {
            line: position.endLine,
            character: position.endColumn
        }
    };
};

export async function handleUndo(rpcClient: BallerinaRpcClient, visualizerLocation: VisualizerLocation) {
    const lastsource = await rpcClient.getVisualizerRpcClient().undo();
    if (lastsource) {
        rpcClient.getLangServerRpcClient().updateFileContent({
            fileUri: visualizerLocation.documentUri,
            content: lastsource
        });
    }
}

export async function handleRedo(rpcClient: BallerinaRpcClient, visualizerLocation: VisualizerLocation) {
    const lastsource = await rpcClient.getVisualizerRpcClient().redo();
    if (lastsource) {
        rpcClient.getLangServerRpcClient().updateFileContent({
            fileUri: visualizerLocation.documentUri,
            content: lastsource
        });
    }
}
