/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { FunctionDefinition, NodePosition } from "@wso2-enterprise/syntax-tree";
import { DiagramDiagnostic, NonPrimitiveBal } from "./connector-wizard-types";
import { CompletionResponse } from "./extended-lang-server-types";
import { Diagnostic } from "vscode-languageserver-types";

export interface Type {
    typeName: string;
    name?: string;
    displayName?: string;
    memberType?: Type;
    inclusionType?: Type;
    paramType?: Type;
    selectedDataType?: string;
    description?: string;
    defaultValue?: any;
    value?: any;
    optional?: boolean;
    defaultable?: boolean;
    fields?: Type[];
    members?: Type[];
    references?: Type[];
    isReturn?: boolean;
    isTypeDef?: boolean;
    isReference?: boolean;
    isStream?: boolean;
    typeInfo?: NonPrimitiveBal;
    hide?: boolean;
    aiSuggestion?: string;
    noCodeGen?: boolean;
    requestName?: string;
    tooltip?: string;
    tooltipActionLink?: string;
    tooltipActionText?: string;
    isErrorType?: boolean;
    isRestParam?: boolean;
    customAutoComplete?: string[];
    validationRegex?: any;
    leftTypeParam?: any;
    rightTypeParam?: any;
    initialDiagnostics?: DiagramDiagnostic[];
    documentation?: string;
    position?: NodePosition;
    selected?: boolean;
    originalTypeName?: string;
    resolvedUnionType?: Type | Type[];
}

export enum TypeNature {
    BLACKLISTED,
    WHITELISTED,
    YET_TO_SUPPORT,
    INVALID,
    NOT_FOUND,
    TYPE_UNAVAILABLE,
    PARAM_NAME_UNAVAILABLE,
    DUMMY
}

export interface DataMapperInputParam {
    name: string;
    type: string;
    isUnsupported?: boolean;
    typeNature?: TypeNature;
    isArray?: boolean;
}

export interface DiagnosticsForFnNameRequest {
    name: string,
    inputParams: DataMapperInputParam[],
    outputType: string,
    fnST: FunctionDefinition,
    targetPosition: NodePosition,
    currentFileContent: string,
    filePath: string
}

export interface DefaultFnNameRequest {
    filePath: string,
    targetPosition: NodePosition,
}

export interface ExtendedDiagnostic extends Diagnostic {}

export interface RecordCompletionsRequest {
    currentFileContent: string,
    importStatements: string[],
    fnSTPosition: NodePosition,
    path: string,
}

export interface CompletionResponseWithModule extends CompletionResponse {
    module?: string;
}

