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
    BallerinaPackagesParams,
    BallerinaProjectComponents,
    BallerinaSTParams,
    BallerinaVersionResponse,
    CodeActionRequest,
    CodeActionResponse,
    CompletionRequest,
    CompletionResponse,
    DefinitionPositionRequest,
    DefinitionResponse,
    DiagnosticsResponse,
    DidChangeRequest,
    DidCloseRequest,
    DidOpenRequest,
    ExecutorPositions,
    ExecutorPositionsRequest,
    LangClientAPI,
    PartialST,
    PartialSTParams,
    RenameRequest,
    RenameResponse,
    STModifyParams,
    SymbolInfo,
    SymbolInfoParams,
    SyntaxTree,
    SyntaxTreeParams,
    TypeFromExpressionParams,
    TypeFromSymbolParams,
    TypesFromExpressionResponse,
    TypesFromFnDefinitionParams,
    TypesFromSymbolResponse,
    UpdateFileContentRequest,
    UpdateFileContentResponse
} from "@wso2-enterprise/ballerina-core";

export class LangClientRpcManager implements LangClientAPI {
    async getSyntaxTree(): Promise<SyntaxTree> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getST(params: SyntaxTreeParams): Promise<SyntaxTree> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getSTByRange(params: BallerinaSTParams): Promise<SyntaxTree> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getBallerinaProjectComponents(params: BallerinaPackagesParams): Promise<BallerinaProjectComponents> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getBallerinaVersion(): Promise<BallerinaVersionResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getCompletion(params: CompletionRequest): Promise<CompletionResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getDiagnostics(params: SyntaxTreeParams): Promise<DiagnosticsResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async codeAction(params: CodeActionRequest): Promise<CodeActionResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async rename(params: RenameRequest): Promise<RenameResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getDefinitionPosition(params: DefinitionPositionRequest): Promise<SyntaxTree> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async stModify(params: STModifyParams): Promise<SyntaxTree> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async updateFileContent(params: UpdateFileContentRequest): Promise<UpdateFileContentResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getTypeFromExpression(params: TypeFromExpressionParams): Promise<TypesFromExpressionResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getTypeFromSymbol(params: TypeFromSymbolParams): Promise<TypesFromSymbolResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getTypesFromFnDefinition(params: TypesFromFnDefinitionParams): Promise<TypesFromSymbolResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async definition(params: DefinitionPositionRequest): Promise<DefinitionResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getSTForFunction(params: STModifyParams): Promise<SyntaxTree> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getExecutorPositions(params: ExecutorPositionsRequest): Promise<ExecutorPositions> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getSTForExpression(params: PartialSTParams): Promise<PartialST> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getSTForSingleStatement(params: PartialSTParams): Promise<PartialST> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getSTForResource(params: PartialSTParams): Promise<PartialST> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getSTForModuleMembers(params: PartialSTParams): Promise<PartialST> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getSTForModulePart(params: PartialSTParams): Promise<PartialST> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getSymbolDocumentation(params: SymbolInfoParams): Promise<SymbolInfo> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async didOpen(params: DidOpenRequest): Promise<> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async didChange(params: DidChangeRequest): Promise<> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async didClose(params: DidCloseRequest): Promise<> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }
}
