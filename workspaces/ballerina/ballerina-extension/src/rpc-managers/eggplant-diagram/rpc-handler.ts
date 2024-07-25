/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
import {
    EggplantAvailableNodesRequest,
    EggplantNodeTemplateRequest,
    EggplantSourceCodeRequest,
    getAvailableNodes,
    getFlowModel,
    getNodeTemplate,
    getSourceCode
} from "@wso2-enterprise/ballerina-core";
import { Messenger } from "vscode-messenger";
import { EggplantDiagramRpcManager } from "./rpc-manager";

export function registerEggplantDiagramRpcHandlers(messenger: Messenger) {
    const rpcManger = new EggplantDiagramRpcManager();
    messenger.onRequest(getFlowModel, () => rpcManger.getFlowModel());
    messenger.onRequest(getSourceCode, (args: EggplantSourceCodeRequest) => rpcManger.getSourceCode(args));
    messenger.onRequest(getAvailableNodes, (args: EggplantAvailableNodesRequest) => rpcManger.getAvailableNodes(args));
    messenger.onRequest(getNodeTemplate, (args: EggplantNodeTemplateRequest) => rpcManger.getNodeTemplate(args));
}
