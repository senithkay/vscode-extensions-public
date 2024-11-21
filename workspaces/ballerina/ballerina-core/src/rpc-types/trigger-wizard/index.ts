/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { TriggerParams, TriggersParams, Triggers, Trigger, TriggerModelRequest, TriggerModelResponse, TriggerModelsRequest, TriggerModelsResponse, TriggerSourceCodeRequest, TriggerSourceCodeResponse } from "../../interfaces/extended-lang-client";
import { ServicesByListenerRequest, ServicesByListenerResponse } from "./interfaces";

export interface TriggerWizardAPI {
    getTriggers: (params: TriggersParams) => Promise<Triggers>;
    getTrigger: (params: TriggerParams) => Promise<Trigger>;
    getServicesByListener: (params: ServicesByListenerRequest) => Promise<ServicesByListenerResponse>;
    getTriggerModels: (params: TriggerModelsRequest) => Promise<TriggerModelsResponse>;
    getTriggerModel: (params: TriggerModelRequest) => Promise<TriggerModelResponse>;
    getTriggerSourceCode: (params: TriggerSourceCodeRequest) => Promise<TriggerSourceCodeResponse>;
}
