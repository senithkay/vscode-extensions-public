import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import {
    InitializeParams, InitializeRequest, InitializeResult, ProtocolConnection,
    Trace, DidOpenTextDocumentNotification,
    DidOpenTextDocumentParams, TextDocumentItem, InitializedNotification, ShutdownRequest, ExitNotification, PublishDiagnosticsNotification, PublishDiagnosticsParams,
    TextDocumentPositionParams, Location
} from 'vscode-languageserver-protocol';
import { BLCTracer } from "./BLCTracer";
import { BLCLogger } from "./BLCLogger";
import { initializeRequest, didOpenTextDocumentParams } from "./messages"
import {
    ASTDidChangeParams, ASTDidChangeResponse, BallerinaConnectorRequest, BallerinaConnectorResponse, BallerinaConnectorsRequest, BallerinaConnectorsResponse, BallerinaExampleListParams,
    BallerinaExampleListResponse, BallerinaProject, BallerinaRecordRequest, BallerinaRecordResponse, DidOpenParams, GetASTParams, GetASTResponse,
    GetBallerinaProjectParams, GetProjectASTParams, GetProjectASTResponse, GetSyntaxTreeParams,
    GetSyntaxTreeResponse, GoToSourceParams, IBallerinaLangClient, RevealRangeParams
} from './IBallerinaLanguageClient'
import { BallerinaASTNode, BallerinaEndpoint, BallerinaSourceFragment } from "./ast-models";
import { LSConnection } from "./LSConnection";

export class BalleriaLanguageClient implements IBallerinaLangClient {

    private _id: number = 1;
    private _name: string = "ballerina";
    private _lsConnection: LSConnection;
    private _clientConnection: ProtocolConnection;

    private _ready: any = null;
    private _initializedError: any = null;
    private _onReady: Promise<void>;
    private _diagnostics?: PublishDiagnosticsParams;
    private _diagnosticsReceived: Promise<void>;
    private _diagnosticsReady: any = null;
    private _diagnosticsError: any = null;

    // constructor
    public constructor(connection: LSConnection) {
        this._lsConnection = connection;
        this._id = 1;
        this._clientConnection = connection.getProtocolConnection();
        this._clientConnection.trace(Trace.Verbose, new BLCTracer());
        this._clientConnection.listen();
        this._onReady = new Promise((resolve, reject) => {
            this._ready = resolve;
            this._initializedError = reject;
        });
        this._diagnosticsReceived = new Promise((resolve, reject) => {
            this._diagnosticsReady = resolve;
            this._diagnosticsError = reject;
        });
        // Send the initializzation request
        this.initialize();
    }

    public onReady(): Promise<void> {
        return this._onReady;
    }

    private initialize() {
        this._clientConnection.sendRequest(InitializeRequest.type, initializeRequest(this._id)).then((result: InitializeResult) => {
            this._clientConnection.sendNotification(InitializedNotification.type, {});
            this._clientConnection.onNotification(PublishDiagnosticsNotification.type, this.handleDiagnostics);
            this._ready();
        });
    }

    public stop(): Promise<void> {
        // Send the shutdown request
        this._clientConnection.sendRequest(ShutdownRequest.type).then(() => {
            // Send exit notification
            this._clientConnection.sendNotification(ExitNotification.type);
        });

        return this._lsConnection.stop();
    }

    public didOpen(path: string) {
        this._clientConnection.sendNotification(DidOpenTextDocumentNotification.type, didOpenTextDocumentParams(path));
    }

    private handleDiagnostics(diagnostics: PublishDiagnosticsParams) {
        this._diagnostics = diagnostics
    }

    public getDiagnostics(): PublishDiagnosticsParams {
        return this._diagnostics!;
    }

    public getSyntaxTree(params: GetSyntaxTreeParams): Thenable<GetSyntaxTreeResponse> {
        return this._clientConnection.sendRequest<GetSyntaxTreeResponse>("ballerinaDocument/syntaxTree", params);
    }

    public getProjectAST(params: GetProjectASTParams): Thenable<GetProjectASTResponse> {
        return this._clientConnection.sendRequest<GetProjectASTResponse>("ballerinaProject/modules", params);
    }

    public getAST(params: GetASTParams): Thenable<GetASTResponse> {
        return this._clientConnection.sendRequest<GetASTResponse>("ballerinaDocument/ast", params);
    }

    public astDidChange(params: ASTDidChangeParams): Thenable<ASTDidChangeResponse> {
        return this._clientConnection.sendRequest("ballerinaDocument/astDidChange", params);
    }

    public fetchExamples(params: BallerinaExampleListParams = {}): Thenable<BallerinaExampleListResponse> {
        return this._clientConnection.sendRequest("ballerinaExample/list", params);
    }

    public parseFragment(params: BallerinaSourceFragment): Thenable<BallerinaASTNode> {
        return this._clientConnection.sendRequest("ballerinaFragment/ast", params).then((resp: any) => resp.ast);
    }

    public getEndpoints(): Thenable<BallerinaEndpoint[]> {
        return this._clientConnection.sendRequest("ballerinaSymbol/endpoints", {})
            .then((resp: any) => resp.endpoints);
    }

    public getBallerinaProject(params: GetBallerinaProjectParams): Thenable<BallerinaProject> {
        return this._clientConnection.sendRequest("ballerinaDocument/project", params);
    }

    public getDefinitionPosition(params: TextDocumentPositionParams): Thenable<Location> {
        // TODO
        return Promise.reject("Not implemented");
    }

    public goToSource(params: GoToSourceParams): void {
        // TODO
    }

    public revealRange(params: RevealRangeParams): void {
        // TODO
    }

    public getRecord(params: BallerinaRecordRequest): Thenable<BallerinaRecordResponse> {
        return this._clientConnection.sendRequest<BallerinaRecordResponse>("ballerinaConnector/record", params);
    }


    public getConnectors(params: BallerinaConnectorsRequest): Thenable<BallerinaConnectorsResponse> {
        return this._clientConnection.sendRequest<BallerinaConnectorsResponse>("ballerinaConnector/connectors");
    }

    public getConnector(params: BallerinaConnectorRequest): Thenable<BallerinaConnectorResponse> {
        return this._clientConnection.sendRequest<BallerinaConnectorResponse>("ballerinaConnector/connector", params);
    }
}
