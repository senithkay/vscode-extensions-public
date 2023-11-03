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

import { BallerinaSTModifyResponse, BallerinaProjectParams, PublishDiagnosticsParams, GetSyntaxTreeParams, GetSyntaxTreeResponse, BallerinaSTModifyRequest, CompletionParams, CompletionResponse, ExpressionTypeRequest, ExpressionTypeResponse, PartialSTRequest, PartialSTResponse, SymbolInfoRequest, SymbolInfoResponse, TypeFromExpressionRequest, TypesFromExpressionResponse, TypeFromSymbolRequest, TypesFromSymbolResponse, TypesFromFnDefinitionRequest } from "../../lang-server-interfaces/extended-lang-server-types";
import { GetBallerinaPackagesParams, BallerinaProjectComponents } from "../../lang-server-interfaces/project-overview-types";
import { TextDocumentPositionParams } from 'vscode-languageserver-protocol';

export interface VisualizerAPI {
    getBallerinaProjectComponents: (
        params: GetBallerinaPackagesParams
    ) => Promise<BallerinaProjectComponents>;
    getDefinitionPosition: (
        params: TextDocumentPositionParams
    ) => Thenable<BallerinaSTModifyResponse>;
    getDiagnostics: (
        params: BallerinaProjectParams
    ) => Thenable<PublishDiagnosticsParams[]>;
    getSyntaxTree: (
        params: GetSyntaxTreeParams
    ) => Thenable<GetSyntaxTreeResponse>;
    stModify: (
        params: BallerinaSTModifyRequest
    ) => Thenable<BallerinaSTModifyResponse>;
    getCompletion: (
        params: CompletionParams
    ) => Thenable<CompletionResponse[]>;
    getType: (
        param: ExpressionTypeRequest
    ) => Thenable<ExpressionTypeResponse>;
    getSTForSingleStatement: (
        param: PartialSTRequest
    ) => Thenable<PartialSTResponse>;
    getSTForExpression: (
        param: PartialSTRequest
    ) => Thenable<PartialSTResponse>;
    getSTForModuleMembers: (
        param: PartialSTRequest
    ) => Thenable<PartialSTResponse>;
    getSTForModulePart: (
        param: PartialSTRequest
    ) => Thenable<PartialSTResponse>;
    getSTForResource: (
        param: PartialSTRequest
    ) => Thenable<PartialSTResponse>;
    getSymbolDocumentation: (
        params: SymbolInfoRequest
    ) => Thenable<SymbolInfoResponse>;
    getTypeFromExpression: (
        params: TypeFromExpressionRequest
    ) => Thenable<TypesFromExpressionResponse>;
    getTypeFromSymbol: (
        params: TypeFromSymbolRequest
    ) => Thenable<TypesFromSymbolResponse>;
    getTypesFromFnDefinition: (
        params: TypesFromFnDefinitionRequest
    ) => Thenable<TypesFromSymbolResponse>;
}