/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ListenerModelRequest, ListenerModelResponse, ServiceModelRequest, ServiceModelResponse, ServiceModelFromCodeRequest, ServiceModelFromCodeResponse, HttpResourceModelRequest, HttpResourceModelResponse, ResourceSourceCodeRequest, ResourceSourceCodeResponse, ListenerSourceCodeRequest, ListenerSourceCodeResponse, ListenersRequest, ListenersResponse, ServiceSourceCodeResponse, ServiceSourceCodeRequest } from "../../interfaces/extended-lang-client";
import {
    ExportOASRequest,
    ExportOASResponse,
    RecordSTRequest,
    RecordSTResponse,
    SourceUpdateResponse,
} from "./interfaces";

export interface ServiceDesignerAPI {
    getRecordST: (params: RecordSTRequest) => Promise<RecordSTResponse>;
    exportOASFile: (params: ExportOASRequest) => Promise<ExportOASResponse>;
    getListeners: (params: ListenersRequest) => Promise<ListenersResponse>;
    getListenerModel: (params: ListenerModelRequest) => Promise<ListenerModelResponse>;
    updateListenerSourceCode: (params: ListenerSourceCodeRequest) => Promise<SourceUpdateResponse>;
    getServiceModel: (params: ServiceModelRequest) => Promise<ServiceModelResponse>;
    updateServiceSourceCode: (params: ServiceSourceCodeRequest) => Promise<SourceUpdateResponse>;
    getServiceModelFromCode: (params: ServiceModelFromCodeRequest) => Promise<ServiceModelFromCodeResponse>;
    getHttpResourceModel: (params: HttpResourceModelRequest) => Promise<HttpResourceModelResponse>;
    updateResourceSourceCode: (params: ResourceSourceCodeRequest) => Promise<SourceUpdateResponse>;
}
