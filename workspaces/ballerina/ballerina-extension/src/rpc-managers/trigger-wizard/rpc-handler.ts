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
    ServicesByListenerRequest,
    TriggerModelRequest,
    TriggerModelsRequest,
    TriggerParams,
    TriggerSourceCodeRequest,
    TriggersParams,
    getServicesByListener,
    getTrigger,
    getTriggerModel,
    getTriggerModels,
    getTriggerSourceCode,
    getTriggers
} from "@wso2-enterprise/ballerina-core";
import { Messenger } from "vscode-messenger";
import { TriggerWizardRpcManager } from "./rpc-manager";

export function registerTriggerWizardRpcHandlers(messenger: Messenger) {
    const rpcManger = new TriggerWizardRpcManager();
    messenger.onRequest(getTriggers, (args: TriggersParams) => rpcManger.getTriggers(args));
    messenger.onRequest(getTrigger, (args: TriggerParams) => rpcManger.getTrigger(args));
    messenger.onRequest(getServicesByListener, (args: ServicesByListenerRequest) => rpcManger.getServicesByListener(args));
    messenger.onRequest(getTriggerModels, (args: TriggerModelsRequest) => rpcManger.getTriggerModels(args));
    messenger.onRequest(getTriggerModel, (args: TriggerModelRequest) => rpcManger.getTriggerModel(args));
    messenger.onRequest(getTriggerSourceCode, (args: TriggerSourceCodeRequest) => rpcManger.getTriggerSourceCode(args));
}
