/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */

import { PartialSTRequest, PartialSTResponse, STModifyRequest, SymbolInfoRequest, SymbolInfoResponse } from "../../interfaces/ballerina";
import {
    BallerinaVersionResponse,
    CodeActionRequest,
    CodeActionResponse,
    CompletionRequest,
    CompletionResponse,
    DefinitionPositionRequest,
    DiagnosticsResponse,
    ProjectComponentsRequest,
    BallerinaProjectComponents,
    RenameRequest,
    RenameResponse,
    STByRangeRequest,
    STRequest,
    SyntaxTreeResponse,
    UpdateFileContentRequest,
    UpdateFileContentResponse,
    TypeFromExpressionRequest,
    TypesFromExpressionResponse,
    TypeFromSymbolRequest,
    TypesFromSymbolResponse,
    TypesFromFnDefinitionRequest,
    DefinitionResponse,
    ExecutorPositionsRequest,
    ExecutorPositionsResponse,
    DidOpenRequest,
    DidChangeRequest,
    DidCloseRequest
} from "./interfaces";

export interface LangServerAPI {
    getSyntaxTree: () => Promise<SyntaxTreeResponse>;
    getST: (params: STRequest) => Promise<SyntaxTreeResponse>;
    getSTByRange: (params: STByRangeRequest) => Promise<SyntaxTreeResponse>;
    getBallerinaProjectComponents: (params: ProjectComponentsRequest) => Promise<BallerinaProjectComponents>;
    getBallerinaVersion: () => Promise<BallerinaVersionResponse>;
    getCompletion: (params: CompletionRequest) => Promise<CompletionResponse>;
    getDiagnostics: (params: STRequest) => Promise<DiagnosticsResponse>;
    codeAction: (params: CodeActionRequest) => Promise<CodeActionResponse>;
    rename: (params: RenameRequest) => Promise<RenameResponse>;
    getDefinitionPosition: (params: DefinitionPositionRequest) => Promise<SyntaxTreeResponse>;
    stModify: (params: STModifyRequest) => Promise<SyntaxTreeResponse>;
    updateFileContent: (params: UpdateFileContentRequest) => Promise<UpdateFileContentResponse>;
    getTypeFromExpression: (params: TypeFromExpressionRequest) => Promise<TypesFromExpressionResponse>;
    getTypeFromSymbol: (params: TypeFromSymbolRequest) => Promise<TypesFromSymbolResponse>;
    getTypesFromFnDefinition: (params: TypesFromFnDefinitionRequest) => Promise<TypesFromSymbolResponse>;
    definition: (params: DefinitionPositionRequest) => Promise<DefinitionResponse>;
    getSTForFunction: (params: STModifyRequest) => Promise<SyntaxTreeResponse>;
    getExecutorPositions: (params: ExecutorPositionsRequest) => Promise<ExecutorPositionsResponse>;
    getSTForExpression: (params: PartialSTRequest) => Promise<PartialSTResponse>;
    getSTForSingleStatement: (params: PartialSTRequest) => Promise<PartialSTResponse>;
    getSTForResource: (params: PartialSTRequest) => Promise<PartialSTResponse>;
    getSTForModuleMembers: (params: PartialSTRequest) => Promise<PartialSTResponse>;
    getSTForModulePart: (params: PartialSTRequest) => Promise<PartialSTResponse>;
    getSymbolDocumentation: (params: SymbolInfoRequest) => Promise<SymbolInfoResponse>;
    didOpen: (params: DidOpenRequest) => void;
    didChange: (params: DidChangeRequest) => void;
    didClose: (params: DidCloseRequest) => void;
}
