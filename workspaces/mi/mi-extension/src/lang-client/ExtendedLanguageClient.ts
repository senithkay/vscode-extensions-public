/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { GetSyntaxTreeRequest } from "@wso2-enterprise/mi-core";
import { Position, Uri, workspace } from "vscode";
import { CompletionParams, LanguageClient, TextEdit } from "vscode-languageclient/node";

export interface GetSyntaxTreeParams {
    documentIdentifier: {
        uri: string;
    };
}

export interface GetSyntaxTreeResponse {
    syntaxTree: any;
    defFilePath: string;
}

export interface GetCompletionParams {
    textDocument: {
        fsPath: string,
        uri: string;
    };
    offset: number;
    context: {
        triggerKind: any;
    };
}

export interface CompletionResponse {
    detail: string;
    insertText: string;
    insertTextFormat: number;
    kind: number;
    label: string;
    additionalTextEdits?: TextEdit[];
    documentation?: string;
    sortText?: string;
    filterText?: string;
    textEdit?: TextEdit;
}

export interface LogSnippetCompletionRequest {
    logLevel: string;
    logCategory?: string;
    logSeparator?: string;
    description?: string;
    properties?: any;
}

export interface LogSnippet {
    snippet: string;
}

export class ExtendedLanguageClient extends LanguageClient {

    async getSyntaxTree(req: GetSyntaxTreeParams): Promise<GetSyntaxTreeResponse> {
        return this.sendRequest(GetSyntaxTreeRequest.method, { uri: "file:///Users/chamupathi/Documents/projects/wso2/synapse/sample.xml" });
    }

    async getCompletion(params: GetCompletionParams): Promise<CompletionResponse[]> {
        let position: Position;
        const doc = await workspace.openTextDocument(Uri.file(params.textDocument.fsPath));
        position = doc.positionAt(params.offset + 1);
        const completionParams: CompletionParams = {
                textDocument: {
                    uri: params.textDocument.uri
                },
                position: {
                    character: position.character + 1,
                    line: position.line
                },
                context: {
                    triggerKind: params.context.triggerKind
                }
            }

        return this.sendRequest("textDocument/completion", completionParams);

    }

    async getSnippetCompletion(req: LogSnippetCompletionRequest): Promise<LogSnippet> {
        return this.sendRequest("xml/getSnippetCompletion", req);
    }
}
