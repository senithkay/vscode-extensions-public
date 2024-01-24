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
    ProjectStructureRequest,
    getProjectStructure,
    getWorkspaces
} from "@wso2-enterprise/mi-core";
import { Messenger } from "vscode-messenger";
import { MiVisualizerRpcManager } from "./rpc-manager";

export function registerMiVisualizerRpcHandlers(messenger: Messenger) {
    const rpcManger = new MiVisualizerRpcManager();
    messenger.onRequest(getWorkspaces, () => rpcManger.getWorkspaces());
    messenger.onRequest(getProjectStructure, (args: ProjectStructureRequest) => rpcManger.getProjectStructure(args));
}
