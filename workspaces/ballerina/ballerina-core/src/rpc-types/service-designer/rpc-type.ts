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
import { CreateServiceRequest, UpdateServiceRequest, DeleteServiceRequest, CreateResourceRequest, UpdateResourceRequest, DeleteResourceRequest, KeywordTypeResponse, RecordSTResponse, RecordSTRequest, goToSourceRequest } from "./types";
import { NotificationType, RequestType } from "vscode-messenger-common";

const _preFix = "service-designer";
export const createService: NotificationType<CreateServiceRequest> = { method: `${_preFix}/createService` };
export const updateService: NotificationType<UpdateServiceRequest> = { method: `${_preFix}/updateService` };
export const deleteService: NotificationType<DeleteServiceRequest> = { method: `${_preFix}/deleteService` };
export const createResource: NotificationType<CreateResourceRequest> = { method: `${_preFix}/createResource` };
export const updateResource: NotificationType<UpdateResourceRequest> = { method: `${_preFix}/updateResource` };
export const deleteResource: NotificationType<DeleteResourceRequest> = { method: `${_preFix}/deleteResource` };
export const getKeywordTypes: RequestType<void, KeywordTypeResponse> = { method: `${_preFix}/getKeywordTypes` };
export const getRecordST: RequestType<RecordSTRequest, RecordSTResponse> = { method: `${_preFix}/getRecordST` };
export const goToSource: NotificationType<goToSourceRequest> = { method: `${_preFix}/goToSource` };
