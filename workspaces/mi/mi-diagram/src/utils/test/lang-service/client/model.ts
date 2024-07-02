// tslint:disable: no-empty-interface
import { InitializeParams, InitializeResult, TextDocumentIdentifier } from "vscode-languageserver-protocol";

export interface GetSyntaxTreeParams {
    documentIdentifier: {
        uri: string;
    };
}

export interface GetSyntaxTreeParams {
    documentIdentifier: TextDocumentIdentifier;
}

export interface GetSyntaxTreeResponse {
    syntaxTree: any;
    defFilePath: string;
}

export interface IMILangClient {

    init: (params?: InitializeParams) => Thenable<InitializeResult>;

    getSyntaxTree: (params: GetSyntaxTreeParams) => Thenable<GetSyntaxTreeResponse>;

    // close: () => void;
}
