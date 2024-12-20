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
import { TriggerParams, TriggersParams, Triggers, Trigger, TriggerModelRequest, TriggerModelResponse, TriggerModelsRequest, TriggerModelsResponse, TriggerSourceCodeRequest, TriggerSourceCodeResponse, TriggerModelFromCodeRequest, TriggerModelFromCodeResponse, TriggerFunctionRequest, TriggerFunctionResponse } from "../../interfaces/extended-lang-client";
import { ServicesByListenerRequest, ServicesByListenerResponse } from "./interfaces";
import { RequestType } from "vscode-messenger-common";

const _preFix = "trigger-wizard";
export const getTriggers: RequestType<TriggersParams, Triggers> = { method: `${_preFix}/getTriggers` };
export const getTrigger: RequestType<TriggerParams, Trigger> = { method: `${_preFix}/getTrigger` };
export const getServicesByListener: RequestType<ServicesByListenerRequest, ServicesByListenerResponse> = { method: `${_preFix}/getServicesByListener` };
export const getTriggerModels: RequestType<TriggerModelsRequest, TriggerModelsResponse> = { method: `${_preFix}/getTriggerModels` };
export const getTriggerModel: RequestType<TriggerModelRequest, TriggerModelResponse> = { method: `${_preFix}/getTriggerModel` };
export const getTriggerSourceCode: RequestType<TriggerSourceCodeRequest, TriggerSourceCodeResponse> = { method: `${_preFix}/getTriggerSourceCode` };
export const updateTriggerSourceCode: RequestType<TriggerSourceCodeRequest, TriggerSourceCodeResponse> = { method: `${_preFix}/updateTriggerSourceCode` };
export const getTriggerModelFromCode: RequestType<TriggerModelFromCodeRequest, TriggerModelFromCodeResponse> = { method: `${_preFix}/getTriggerModelFromCode` };
export const addTriggerFunction: RequestType<TriggerFunctionRequest, TriggerFunctionResponse> = { method: `${_preFix}/addTriggerFunction` };
export const updateTriggerFunction: RequestType<TriggerFunctionRequest, TriggerFunctionResponse> = { method: `${_preFix}/updateTriggerFunction` };
