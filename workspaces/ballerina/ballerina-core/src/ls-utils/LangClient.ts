/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    InitializeRequest, InitializeResult, ProtocolConnection,
    Trace, DidOpenTextDocumentNotification,
    DidOpenTextDocumentParams, InitializedNotification, PublishDiagnosticsNotification, PublishDiagnosticsParams,
    DidCloseTextDocumentParams, DidCloseTextDocumentNotification
} from 'vscode-languageserver-protocol';
import { BLCTracer } from "./BLCTracer";
import { initializeRequest } from "./messages"
import { LSConnection } from "./LSConnection";
import { GetSyntaxTreeParams, GetSyntaxTreeResponse } from "../interfaces/ballerina";

interface IBallerinaLangClient {

    didOpen: (Params: DidOpenTextDocumentParams) => void;

    didClose: (params: DidCloseTextDocumentParams) => void;

    getSyntaxTree: (params: GetSyntaxTreeParams) => Thenable<GetSyntaxTreeResponse>;

}

export class BalleriaLanguageClient implements IBallerinaLangClient {

    private _id: number = 1;
    private _name: string = "ballerina";
    private _clientConnection: ProtocolConnection;

    private _ready: any = null;
    private _diagnostics?: PublishDiagnosticsParams;

    // constructor
    public constructor(connection: LSConnection) {
        this._id = 1;
        this._clientConnection = connection.getProtocolConnection();
        this._clientConnection.trace(Trace.Verbose, new BLCTracer());
        this._clientConnection.listen();
        // Send the initializzation request
        this.initialize();
    }

    private initialize() {
        this._clientConnection.sendRequest(InitializeRequest.type, initializeRequest(this._id)).then((result: InitializeResult) => {
            this._clientConnection.sendNotification(InitializedNotification.type, {});
            this._clientConnection.onNotification(PublishDiagnosticsNotification.type, this.handleDiagnostics);
            this._ready();
        });
    }

    private handleDiagnostics(diagnostics: PublishDiagnosticsParams) {
        this._diagnostics = diagnostics
    }

    public didOpen(params: DidOpenTextDocumentParams) {
        this._clientConnection.sendNotification(DidOpenTextDocumentNotification.type, params);
    }

    public didClose(params: DidCloseTextDocumentParams) {
        this._clientConnection.sendNotification(DidCloseTextDocumentNotification.type, params);
    }

    public getSyntaxTree(params: GetSyntaxTreeParams): Thenable<GetSyntaxTreeResponse> {
        return this._clientConnection.sendRequest<GetSyntaxTreeResponse>("ballerinaDocument/syntaxTree", params);
    }
}
