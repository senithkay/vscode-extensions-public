// tslint:disable-next-line:no-submodule-imports
import { IConnection } from "monaco-languageclient/lib/connection";
import { InitializeParams, InitializeResult } from "vscode-languageserver-protocol";

import { GetSyntaxTreeParams, GetSyntaxTreeResponse, IMILangClient } from "./model";

export class MILangClient implements IMILangClient {

    constructor(
        public lsConnection: IConnection) {
    }

    public init(params: InitializeParams = initParams): Thenable<InitializeResult> {
        this.lsConnection.listen();
        console.log("Initializ language server ", params);
        return this.lsConnection.initialize({ capabilities: {}, processId: null, rootUri: null })
                .then((resp) => {
                    return resp;
                }) as Thenable<InitializeResult>;
    }

    // public async didOpen(fileUri: string) {
    //     if (fs.existsSync(fileUri) && fs.lstatSync(fileUri).isFile()) {
    //         const content: string = readFileSync(fileUri, { encoding: 'utf-8' });
    //         const didOpenParams = {
    //             textDocument: {
    //                 uri: fileUri,
    //                 languageId: 'xml',
    //                 version: 1,
    //                 text: content
    //             }
    //         };
    //         await this.sendNotification("textDocument/didOpen", didOpenParams);
    //     }
    // }

    public getSyntaxTree(params: GetSyntaxTreeParams): Thenable<GetSyntaxTreeResponse> {
        return this.lsConnection.sendRequest<GetSyntaxTreeResponse>("synapse/syntaxTree", params);
    }
}

export const initParams: InitializeParams = {
    capabilities: {},
    processId: process.pid,
    rootUri: null,
};
