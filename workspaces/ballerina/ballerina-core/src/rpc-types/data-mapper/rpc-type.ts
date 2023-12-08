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
    TypeFromExpressionRequest,
    TypeFromSymbolRequest,
    TypesFromExpressionResponse,
    TypesFromFnDefinitionRequest,
    TypesFromSymbolResponse
} from "../..";
import { Location, LocationLink } from "vscode-languageserver-types";
import { TextDocumentPositionParams } from "../../lang-server-interfaces/vscode-langserver-types";
import { RequestType } from "vscode-messenger-common";

const _preFix = "data-mapper";
export const getTypeFromExpression: RequestType<TypeFromExpressionRequest, TypesFromExpressionResponse> = { method: `${_preFix}/getTypeFromExpression` };
export const getTypeFromSymbol: RequestType<TypeFromSymbolRequest, TypesFromSymbolResponse> = { method: `${_preFix}/getTypeFromSymbol` };
export const getTypesFromFnDefinition: RequestType<TypesFromFnDefinitionRequest, TypesFromSymbolResponse> = { method: `${_preFix}/getTypesFromFnDefinition` };
export const definition: RequestType<TextDocumentPositionParams, Location | Location[] | LocationLink[] | null> = { method: `${_preFix}/definition` };
