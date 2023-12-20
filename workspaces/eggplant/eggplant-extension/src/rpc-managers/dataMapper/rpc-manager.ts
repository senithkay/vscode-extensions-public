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
    TypeFromExpressionRequest,
    TypeFromSymbolRequest,
    TypesFromExpressionResponse,
    TypesFromFnDefinitionRequest,
    TypesFromSymbolResponse,
    TextDocumentPositionParams
} from "@wso2-enterprise/ballerina-core";
import { Location, LocationLink } from "vscode-languageserver-types";
import { stateService } from "../../stateMachine";
import { LangClientInterface } from "@wso2-enterprise/eggplant-core";


export class DataMapperRpcManager implements DataMapperAPI {

    private _snapshot = stateService.getSnapshot();
    private _context = this._snapshot.context;
    private _langClient = this._context.langServer as LangClientInterface;

    async getTypeFromExpression(params: TypeFromExpressionRequest): Promise<TypesFromExpressionResponse> {
        return this._langClient.getTypeFromExpression(params);
    }

    async getTypeFromSymbol(params: TypeFromSymbolRequest): Promise<TypesFromSymbolResponse> {
        return this._langClient.getTypeFromSymbol(params);
    }

    async getTypesFromFnDefinition(params: TypesFromFnDefinitionRequest): Promise<TypesFromSymbolResponse> {
        return this._langClient.getTypesFromFnDefinition(params);
    }

    async definition(params: TextDocumentPositionParams): Promise<Location | Location[] | LocationLink[] | null> {
        return this._langClient.definition(params);
    }
}
