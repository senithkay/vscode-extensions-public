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
    CreateResourceRequest,
    CreateServiceRequest,
    DeleteResourceRequest,
    DeleteServiceRequest,
    GoToSourceRequest,
    RecordSTRequest,
    UpdateResourceRequest,
    UpdateServiceRequest,
    createResource,
    createService,
    deleteResource,
    deleteService,
    getKeywordTypes,
    getRecordST,
    goToSource,
    updateResource,
    updateService
} from "@wso2-enterprise/ballerina-core";
import { Messenger } from "vscode-messenger";
import { ServiceDesignerRpcManager } from "./rpc-manager";

export function registerServiceDesignerRpcHandlers(messenger: Messenger) {
    const rpcManger = new ServiceDesignerRpcManager();
    messenger.onRequest(createService, (args: CreateServiceRequest) => rpcManger.createService(args));
    messenger.onRequest(updateService, (args: UpdateServiceRequest) => rpcManger.updateService(args));
    messenger.onRequest(deleteService, (args: DeleteServiceRequest) => rpcManger.deleteService(args));
    messenger.onRequest(createResource, (args: CreateResourceRequest) => rpcManger.createResource(args));
    messenger.onRequest(updateResource, (args: UpdateResourceRequest) => rpcManger.updateResource(args));
    messenger.onRequest(deleteResource, (args: DeleteResourceRequest) => rpcManger.deleteResource(args));
    messenger.onRequest(getKeywordTypes, () => rpcManger.getKeywordTypes());
    messenger.onRequest(getRecordST, (args: RecordSTRequest) => rpcManger.getRecordST(args));
    messenger.onNotification(goToSource, (args: GoToSourceRequest) => rpcManger.goToSource(args));
}
