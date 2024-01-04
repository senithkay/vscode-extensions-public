/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
import { STModification } from "@wso2-enterprise/ballerina-core";
import {
    CreateResourceRequest,
    CreateServiceRequest,
    DeleteResourceRequest,
    DeleteServiceRequest,
    ServiceDesignerAPI,
    UpdateResourceRequest,
    UpdateServiceRequest
} from "@wso2-enterprise/eggplant-core";
import { applyModifications, updateFileContent } from "../../utils/modification";
import { StateMachine } from "../../stateMachine";

export class ServiceDesignerRpcManager implements ServiceDesignerAPI {
    async createService(params: CreateServiceRequest): Promise<void> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async updateService(params: UpdateServiceRequest): Promise<void> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async deleteService(params: DeleteServiceRequest): Promise<void> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async createResource(params: CreateResourceRequest): Promise<void> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async updateResource(params: UpdateResourceRequest): Promise<void> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async deleteResource(params: DeleteResourceRequest): Promise<void> {
        const fileName = StateMachine.context().fileName as string;
        const deleteModification: STModification = {
            type: 'DELETE',
            ...params.position
        };

        const response = await applyModifications(fileName, [deleteModification]);

        if (response.parseSuccess) {
            await updateFileContent({fileUri: fileName, content: response.source});
        }
    }
}
