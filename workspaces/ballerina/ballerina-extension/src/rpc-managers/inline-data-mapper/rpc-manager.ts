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
    IOTypeRequest,
    IOTypeResponse,
    InlineDataMapperAPI,
    VisibleVariableTypes,
    VisibleVariableTypesParams
} from "@wso2-enterprise/ballerina-core";

import { StateMachine } from "../../stateMachine";

export class InlineDataMapperRpcManager implements InlineDataMapperAPI {
    async getIOTypes(params: IOTypeRequest): Promise<IOTypeResponse> {
        return new Promise(async (resolve) => {
            const request: VisibleVariableTypesParams = {
                filePath: params.filePath,
                position: params.position
            };
            const type = await StateMachine.langClient().getVisibleVariableTypes(request) as VisibleVariableTypes;

            console.log("VisibleVariableTypes: ", type);
            
            const response: IOTypeResponse = {
                inputTypes: [],
                outputType: undefined
            };
            resolve(response);
        });
    }
}
