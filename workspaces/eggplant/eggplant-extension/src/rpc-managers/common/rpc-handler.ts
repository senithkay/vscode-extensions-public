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
    DeleteSourceRequest,
    GoToSourceRequest,
    UpdateSourceRequest,
    deleteSource,
    getTypes,
    goToSource,
    updateSource
} from "@wso2-enterprise/eggplant-core";
import { Messenger } from "vscode-messenger";
import { CommonRpcManager } from "./rpc-manager";

export function registerCommonRpcHandlers(messenger: Messenger) {
    const rpcManger = new CommonRpcManager();
    messenger.onRequest(getTypes, () => rpcManger.getTypes());
    messenger.onRequest(updateSource, (args: UpdateSourceRequest) => rpcManger.updateSource(args));
    messenger.onRequest(deleteSource, (args: DeleteSourceRequest) => rpcManger.deleteSource(args));
    messenger.onNotification(goToSource, (args: GoToSourceRequest) => rpcManger.goToSource(args));
}
