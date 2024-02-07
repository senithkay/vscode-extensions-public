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
    ServiceResponse,
    UpdateResourceRequest,
    UpdateServiceRequest
} from "./interfaces";
import { RequestType } from "vscode-messenger-common";

const _preFix = "service-designer";
export const createService: RequestType<CreateServiceRequest, ServiceResponse> = { method: `${_preFix}/createService` };
export const updateService: RequestType<UpdateServiceRequest, ServiceResponse> = { method: `${_preFix}/updateService` };
export const deleteService: RequestType<DeleteServiceRequest, ServiceResponse> = { method: `${_preFix}/deleteService` };
export const createResource: RequestType<CreateResourceRequest, ResourceResponse> = { method: `${_preFix}/createResource` };
export const updateResource: RequestType<UpdateResourceRequest, ResourceResponse> = { method: `${_preFix}/updateResource` };
export const deleteResource: RequestType<DeleteResourceRequest, ResourceResponse> = { method: `${_preFix}/deleteResource` };
export const getKeywordTypes: RequestType<void, KeywordTypeResponse> = { method: `${_preFix}/getKeywordTypes` };
export const getRecordST: RequestType<RecordSTRequest, RecordSTResponse> = { method: `${_preFix}/getRecordST` };
