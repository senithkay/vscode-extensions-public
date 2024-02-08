/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
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

export interface ServiceDesignerAPI {
    createService: (params: CreateServiceRequest) => Promise<ServiceResponse>;
    updateService: (params: UpdateServiceRequest) => Promise<ServiceResponse>;
    deleteService: (params: DeleteServiceRequest) => Promise<ServiceResponse>;
    createResource: (params: CreateResourceRequest) => Promise<ResourceResponse>;
    updateResource: (params: UpdateResourceRequest) => Promise<ResourceResponse>;
    deleteResource: (params: DeleteResourceRequest) => Promise<ResourceResponse>;
    getKeywordTypes: () => Promise<KeywordTypeResponse>;
    getRecordST: (params: RecordSTRequest) => Promise<RecordSTResponse>;
}
