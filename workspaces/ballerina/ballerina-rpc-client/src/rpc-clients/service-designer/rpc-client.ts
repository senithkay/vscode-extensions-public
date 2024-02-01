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
    KeywordTypeResponse,
    RecordSTRequest,
    RecordSTResponse,
    ServiceDesignerAPI,
    UpdateResourceRequest,
    UpdateServiceRequest,
    createResource,
    createService,
    deleteResource,
    deleteService,
    getKeywordTypes,
    getRecordST,
    updateResource,
    updateService
} from "@wso2-enterprise/ballerina-core";
import { HOST_EXTENSION } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";

export class ServiceDesignerRpcClient implements ServiceDesignerAPI {
    private _messenger: Messenger;

    constructor(messenger: Messenger) {
        this._messenger = messenger;
    }

    createService(params: CreateServiceRequest): void {
        return this._messenger.sendNotification(createService, HOST_EXTENSION, params);
    }

    updateService(params: UpdateServiceRequest): void {
        return this._messenger.sendNotification(updateService, HOST_EXTENSION, params);
    }

    deleteService(params: DeleteServiceRequest): void {
        return this._messenger.sendNotification(deleteService, HOST_EXTENSION, params);
    }

    createResource(params: CreateResourceRequest): void {
        return this._messenger.sendNotification(createResource, HOST_EXTENSION, params);
    }

    updateResource(params: UpdateResourceRequest): void {
        return this._messenger.sendNotification(updateResource, HOST_EXTENSION, params);
    }

    deleteResource(params: DeleteResourceRequest): void {
        return this._messenger.sendNotification(deleteResource, HOST_EXTENSION, params);
    }

    getKeywordTypes(): Promise<KeywordTypeResponse> {
        return this._messenger.sendRequest(getKeywordTypes, HOST_EXTENSION);
    }

    getRecordST(params: RecordSTRequest): Promise<RecordSTResponse> {
        return this._messenger.sendRequest(getRecordST, HOST_EXTENSION, params);
    }
}
