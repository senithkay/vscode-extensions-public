/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { UpdatedArtifactsResponse } from "../../interfaces/bi";
import { ListenerModelRequest, ListenerModelResponse, ServiceModelRequest, ServiceModelResponse, ServiceModelFromCodeRequest, ServiceModelFromCodeResponse, HttpResourceModelRequest, HttpResourceModelResponse, FunctionSourceCodeRequest, ListenerSourceCodeRequest, ListenersRequest, ListenersResponse, ServiceSourceCodeRequest, ListenerModelFromCodeRequest, ListenerModelFromCodeResponse, TriggerModelsRequest, TriggerModelsResponse, FunctionModelRequest, FunctionModelResponse } from "../../interfaces/extended-lang-client";
import {
    ExportOASRequest,
    ExportOASResponse,
} from "./interfaces";

export interface ServiceDesignerAPI {
    exportOASFile: (params: ExportOASRequest) => Promise<ExportOASResponse>;
    getTriggerModels: (params: TriggerModelsRequest) => Promise<TriggerModelsResponse>;
    getListeners: (params: ListenersRequest) => Promise<ListenersResponse>;
    getListenerModel: (params: ListenerModelRequest) => Promise<ListenerModelResponse>;
    addListenerSourceCode: (params: ListenerSourceCodeRequest) => Promise<UpdatedArtifactsResponse>;
    updateListenerSourceCode: (params: ListenerSourceCodeRequest) => Promise<UpdatedArtifactsResponse>;
    getListenerModelFromCode: (params: ListenerModelFromCodeRequest) => Promise<ListenerModelFromCodeResponse>;
    getServiceModel: (params: ServiceModelRequest) => Promise<ServiceModelResponse>;
    getFunctionModel: (params: FunctionModelRequest) => Promise<FunctionModelResponse>;
    addServiceSourceCode: (params: ServiceSourceCodeRequest) => Promise<UpdatedArtifactsResponse>;
    updateServiceSourceCode: (params: ServiceSourceCodeRequest) => Promise<UpdatedArtifactsResponse>;
    getServiceModelFromCode: (params: ServiceModelFromCodeRequest) => Promise<ServiceModelFromCodeResponse>;
    getHttpResourceModel: (params: HttpResourceModelRequest) => Promise<HttpResourceModelResponse>;
    addResourceSourceCode: (params: FunctionSourceCodeRequest) => Promise<UpdatedArtifactsResponse>;
    addFunctionSourceCode: (params: FunctionSourceCodeRequest) => Promise<UpdatedArtifactsResponse>;
    updateResourceSourceCode: (params: FunctionSourceCodeRequest) => Promise<UpdatedArtifactsResponse>;
}
