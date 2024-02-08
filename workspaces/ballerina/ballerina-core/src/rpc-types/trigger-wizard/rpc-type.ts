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
import { TriggerRequest, TriggerResponse, TriggersRequest, TriggersResponse } from "./interfaces";
import { RequestType } from "vscode-messenger-common";

const _preFix = "trigger-wizard";
export const getTriggers: RequestType<TriggersRequest, TriggersResponse> = { method: `${_preFix}/getTriggers` };
export const getTrigger: RequestType<TriggerRequest, TriggerResponse> = { method: `${_preFix}/getTrigger` };
