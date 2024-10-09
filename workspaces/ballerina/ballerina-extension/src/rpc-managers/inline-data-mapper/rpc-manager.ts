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
    TypeFromSymbolParams,
    TypesFromSymbol,
    VisibleVariableTypes,
    VisibleVariableTypesParams
} from "@wso2-enterprise/ballerina-core";
import { URI } from "vscode-uri";

import { StateMachine } from "../../stateMachine";
import { transformTypeFieldToIDMType } from "../../utils/inline-data-mapper";

export class InlineDataMapperRpcManager implements InlineDataMapperAPI {
    async getIOTypes(params: IOTypeRequest): Promise<IOTypeResponse> {
        return new Promise(async (resolve) => {
            const visibleTypesRequest: VisibleVariableTypesParams = {
                filePath: params.filePath,
                position: params.position
            };
            const visibleTypes = await StateMachine
                .langClient()
                .getVisibleVariableTypes(visibleTypesRequest) as VisibleVariableTypes;

            const inputTypes = [];
            
            visibleTypes?.categories?.map((visibleType) => {
                visibleType.types.map((type) => {
                    const transformedType = transformTypeFieldToIDMType(type, visibleType.name);
                    transformedType && inputTypes.push(transformedType);
                });
            });

            console.log("VisibleVariableTypes: ", visibleTypes);
            console.log("Transformed VisibleVariableTypes: ", inputTypes);

            const outptutTypeRequest: TypeFromSymbolParams = {
                documentIdentifier: {
                    uri: URI.file(params.filePath).toString()
                },
                positions: [{ line: params.position.line, offset: params.position.offset }]
            };

            const outputType = await StateMachine.langClient().getTypeFromSymbol(outptutTypeRequest);

            // check whether the output type is a TypesFromSymbol or NOT_SUPPORTED_TYPE
            const isTypesFromSymbol = (outputType as TypesFromSymbol).types ? true : false;

            if (!isTypesFromSymbol) {
                const response: IOTypeResponse = {
                    inputTypes,
                    outputType: undefined
                };
                resolve(response);
                return;
            }

            const outputTypeTransformed = transformTypeFieldToIDMType({
                name: '',
                type: (outputType as TypesFromSymbol).types[0].type
            });

            console.log("outputType: ", outputType);
            console.log("Transformed outputType: ", outputTypeTransformed);
            
            const response: IOTypeResponse = {
                inputTypes,
                outputType: outputTypeTransformed
            };
            resolve(response);
        });
    }
}
