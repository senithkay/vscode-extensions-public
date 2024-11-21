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
    ServicesByListenerResponse,
    Trigger,
    TriggerModelRequest,
    TriggerModelResponse,
    TriggerModelsRequest,
    TriggerModelsResponse,
    TriggerParams,
    TriggerSourceCodeRequest,
    TriggerSourceCodeResponse,
    TriggerWizardAPI,
    Triggers,
    TriggersParams,
    getServicesByListener,
    getTrigger,
    getTriggerModel,
    getTriggerModels,
    getTriggerSourceCode,
    getTriggers
} from "@wso2-enterprise/ballerina-core";
import { HOST_EXTENSION } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";

export class TriggerWizardRpcClient implements TriggerWizardAPI {
    private _messenger: Messenger;

    constructor(messenger: Messenger) {
        this._messenger = messenger;
    }

    getTriggers(params: TriggersParams): Promise<Triggers> {
        return this._messenger.sendRequest(getTriggers, HOST_EXTENSION, params);
    }

    getTrigger(params: TriggerParams): Promise<Trigger> {
        return this._messenger.sendRequest(getTrigger, HOST_EXTENSION, params);
    }

    getServicesByListener(params: ServicesByListenerRequest): Promise<ServicesByListenerResponse> {
        return this._messenger.sendRequest(getServicesByListener, HOST_EXTENSION, params);
    }

    getTriggerModels(params: TriggerModelsRequest): Promise<TriggerModelsResponse> {
        return this._messenger.sendRequest(getTriggerModels, HOST_EXTENSION, params);
    }

    getTriggerModel(params: TriggerModelRequest): Promise<TriggerModelResponse> {
        return this._messenger.sendRequest(getTriggerModel, HOST_EXTENSION, params);
    }

    getTriggerSourceCode(params: TriggerSourceCodeRequest): Promise<TriggerSourceCodeResponse> {
        return this._messenger.sendRequest(getTriggerSourceCode, HOST_EXTENSION, params);
    }
}
