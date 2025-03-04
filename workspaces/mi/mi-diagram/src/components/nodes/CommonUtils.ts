/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { POPUP_EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { RpcClient } from "@wso2-enterprise/mi-rpc-client";
import { ConnectorNodeModel } from "./ConnectorNode/ConnectorNodeModel";
import { Connector } from "@wso2-enterprise/mi-syntax-tree/lib/src";


export const handleOnConnectionClick = async (e: any, node: ConnectorNodeModel, stNode: Connector, rpcClient: RpcClient) => {
    e.stopPropagation();

    const nodeRange = await getConnectionNodeRange(node, stNode, rpcClient);

    const connectorData = await rpcClient.getMiDiagramRpcClient().getAvailableConnectors({
        documentUri: node.documentUri,
        connectorName: stNode.tag.split(".")[0]
    });

    const definition = await rpcClient?.getMiDiagramRpcClient().getDefinition({
        document: {
            uri: node.documentUri,
        },
        position: nodeRange.start
    });

    if (!definition) {
        return;
    }

    if (e.ctrlKey || e.metaKey) {
        // open file of selected connection
        rpcClient.getMiDiagramRpcClient().openFile({ path: definition.uri, beside: true });

    } else if (node.isSelected()) {
        rpcClient.getMiVisualizerRpcClient().openView({
            type: POPUP_EVENT_TYPE.OPEN_VIEW,
            location: {
                documentUri: definition.uri,
                view: MACHINE_VIEW.ConnectionForm,
                customProps: {
                    connectionName: stNode.configKey,
                    connector: connectorData
                }
            },
            isPopup: true
        });
    }
}

const getConnectionNodeRange = async (node: ConnectorNodeModel, stNode: Connector, rpcClient: RpcClient) => {
    const text = await rpcClient?.getMiDiagramRpcClient().getTextAtRange({
        documentUri: node.documentUri,
        range: node.stNode.range.startTagRange
    });

    const lastQuoteIndex = text.text.lastIndexOf('"') !== -1 ? text.text.lastIndexOf('"') : text.text.lastIndexOf("'");
    const textBeforeLastQuote = text.text.substring(0, lastQuoteIndex + 1);

    const configKeyLines = textBeforeLastQuote.split('\n');
    const connectionNameLine = configKeyLines?.[configKeyLines.length - 1];

    const firstQuoteIndex = connectionNameLine?.indexOf('"') !== -1 ? connectionNameLine?.indexOf('"') : connectionNameLine?.indexOf("'");

    const newlineCount = configKeyLines.length - 1;

    const connectionNameStartPosition = {
        line: node.stNode.range.startTagRange.start.line + newlineCount,
        character: newlineCount === 0 ? node.stNode.range.startTagRange.start.character + firstQuoteIndex + 1
            : firstQuoteIndex + 1
    }

    const connectionNameEndPosition = {
        line: node.stNode.range.startTagRange.start.line + newlineCount,
        character: newlineCount === 0 ? node.stNode.range.startTagRange.start.character + firstQuoteIndex + stNode.configKey.length + 1
            : firstQuoteIndex + stNode.configKey.length + 1
    }

    const nodeRange = { start: connectionNameStartPosition, end: connectionNameEndPosition };

    return nodeRange;
}
