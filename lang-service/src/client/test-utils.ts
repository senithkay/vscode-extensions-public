import { InitializeParams, InitializeResult,
    Location, TextDocumentPositionParams } from "vscode-languageserver-protocol";
import {
    BallerinaTriggersRequest,
    BallerinaTriggersResponse,
    ExpressionTypeDescRequest,
    ExpressionTypeRequest,
    ExpressionTypeResponse,
    SymbolInfoRequest,
    SymbolInfoResponse,
    TypeFromSymbolResponse
} from ".";

import { BallerinaASTNode, BallerinaEndpoint, BallerinaSourceFragment } from "./ast-models";
import { ASTDidChangeParams, ASTDidChangeResponse, BallerinaConnectorRequest, BallerinaConnectorResponse, BallerinaConnectorsRequest, BallerinaConnectorsResponse, BallerinaExampleListParams,
    BallerinaExampleListResponse, BallerinaProject, BallerinaRecordRequest, BallerinaRecordResponse, BallerinaTriggerRequest, BallerinaTriggerResponse, GetASTParams, GetASTResponse, GetBallerinaProjectParams,
    GetProjectASTParams, GetProjectASTResponse, GetSyntaxTreeParams, GetSyntaxTreeResponse,
    GoToSourceParams,
    IBallerinaLangClient,
    RevealRangeParams} from "./model";

// tslint:disable:no-object-literal-type-assertion
export class EmptyLanguageClient implements IBallerinaLangClient {

    public init(params?: InitializeParams): Thenable<InitializeResult> {
        return Promise.reject();
    }

    public getProjectAST(params: GetProjectASTParams): Thenable<GetProjectASTResponse> {
        return Promise.reject();
    }

    public getAST(params: GetASTParams): Thenable<GetASTResponse> {
        return Promise.reject();
    }

    public getSyntaxTree(params: GetSyntaxTreeParams): Thenable<GetSyntaxTreeResponse> {
        return Promise.reject();
    }

    public astDidChange(params: ASTDidChangeParams): Thenable<ASTDidChangeResponse> {
        return Promise.reject();
    }

    public fetchExamples(params: BallerinaExampleListParams = {}): Thenable<BallerinaExampleListResponse> {
        return Promise.reject();
    }

    public parseFragment(params: BallerinaSourceFragment): Thenable<BallerinaASTNode> {
        return Promise.reject();
    }

    public getEndpoints(): Thenable<BallerinaEndpoint[]> {
        return Promise.reject();
    }

    public getBallerinaProject(params: GetBallerinaProjectParams): Thenable<BallerinaProject> {
        return Promise.reject();
    }

    public getDefinitionPosition(params: TextDocumentPositionParams): Thenable<Location> {
        return Promise.reject();
    }

    public getRecord(params: BallerinaRecordRequest): Thenable<BallerinaRecordResponse> {
        return Promise.reject();
    }


    public getConnectors(params: BallerinaConnectorsRequest): Thenable<BallerinaConnectorsResponse> {
        return Promise.reject();
    }

    public getTriggers(params: BallerinaTriggersRequest): Thenable<BallerinaTriggersResponse> {
        return Promise.reject();
    }

    public getTrigger(params: BallerinaTriggerRequest): Thenable<BallerinaTriggerResponse> {
        return Promise.reject();
    }

    public getConnector(params: BallerinaConnectorRequest): Thenable<BallerinaConnectorResponse> {
        return Promise.reject();
    }

    public goToSource(params: GoToSourceParams): void {
        // EMPTY
    }

    public revealRange(params: RevealRangeParams): void {
        // EMPTY
    }

    public close(): void {
        // EMPTY
    }

    public getSymbolDocumentation(params: SymbolInfoRequest): Thenable<SymbolInfoResponse> {
        return Promise.reject();
    }

    public getTypeFromExpression(params: ExpressionTypeDescRequest): Thenable<TypeFromSymbolResponse> {
        return Promise.reject();
    }

    public getTypeFromSymbol(params: ExpressionTypeRequest): Thenable<TypeFromSymbolResponse> {
        return Promise.reject();
    }
}
