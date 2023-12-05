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
import {
    DataMapperAPI,
    DefinitionRequest,
    TypeFromExpressionRequest,
    TypeFromSymbolRequest,
    TypesFromExpressionResponse,
    TypesFromFnDefinitionRequest,
    TypesFromSymbolResponse,
    definition,
    getTypeFromExpression,
    getTypeFromSymbol,
    getTypesFromFnDefinition
} from "@wso2-enterprise/ballerina-core";
import { HOST_EXTENSION } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";

export class DataMapperRpcClient implements DataMapperAPI {
    private _messenger: Messenger;

    constructor(messenger: Messenger) {
        this._messenger = messenger;
    }

    getTypeFromExpression(params: TypeFromExpressionRequest): Promise<TypesFromExpressionResponse> {
        return this._messenger.sendRequest(getTypeFromExpression, HOST_EXTENSION, params);
    }

    getTypeFromSymbol(params: TypeFromSymbolRequest): Promise<TypesFromSymbolResponse> {
        return this._messenger.sendRequest(getTypeFromSymbol, HOST_EXTENSION, params);
    }

    getTypesFromFnDefinition(params: TypesFromFnDefinitionRequest): Promise<TypesFromSymbolResponse> {
        return this._messenger.sendRequest(getTypesFromFnDefinition, HOST_EXTENSION, params);
    }

    definition(params: DefinitionRequest): Promise<> {
        return this._messenger.sendRequest(definition, HOST_EXTENSION, params);
    }
}
