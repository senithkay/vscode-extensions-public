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
    ResourceResponse,
    ServiceDesignerAPI,
    ServiceResponse,
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

    createService(params: CreateServiceRequest): Promise<ServiceResponse> {
        return this._messenger.sendRequest(createService, HOST_EXTENSION, params);
    }

    updateService(params: UpdateServiceRequest): Promise<ServiceResponse> {
        return this._messenger.sendRequest(updateService, HOST_EXTENSION, params);
    }

    deleteService(params: DeleteServiceRequest): Promise<ServiceResponse> {
        return this._messenger.sendRequest(deleteService, HOST_EXTENSION, params);
    }

    createResource(params: CreateResourceRequest): Promise<ResourceResponse> {
        return this._messenger.sendRequest(createResource, HOST_EXTENSION, params);
    }

    updateResource(params: UpdateResourceRequest): Promise<ResourceResponse> {
        return this._messenger.sendRequest(updateResource, HOST_EXTENSION, params);
    }

    deleteResource(params: DeleteResourceRequest): Promise<ResourceResponse> {
        return this._messenger.sendRequest(deleteResource, HOST_EXTENSION, params);
    }

    getKeywordTypes(): Promise<KeywordTypeResponse> {
        return this._messenger.sendRequest(getKeywordTypes, HOST_EXTENSION);
    }

    getRecordST(params: RecordSTRequest): Promise<RecordSTResponse> {
        return this._messenger.sendRequest(getRecordST, HOST_EXTENSION, params);
    }
}
