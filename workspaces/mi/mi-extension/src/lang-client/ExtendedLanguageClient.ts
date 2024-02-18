/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ProjectStructureResponse, getSyntaxTree } from "@wso2-enterprise/mi-core";
import { readFileSync } from "fs";
import { Position, Uri, workspace } from "vscode";
import { CompletionParams, LanguageClient, TextEdit } from "vscode-languageclient/node";
import { TextDocumentIdentifier } from "vscode-languageserver-protocol";

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

export interface DidOpenParams {
    textDocument: {
        uri: string;
        languageId: string;
        text: string;
        version: number;
    };
}

export type TPosition = {
    character: number;
    line: number;
};

export interface GoToDefinitionResponse {
    uri: string,
    range: {
        end: TPosition,
        start: TPosition
    }
}

export class ExtendedLanguageClient extends LanguageClient {

    async getSyntaxTree(req: GetSyntaxTreeParams): Promise<GetSyntaxTreeResponse> {
        this.didOpen(req.documentIdentifier.uri);
        return this.sendRequest('synapse/syntaxTree', { uri: Uri.parse(req.documentIdentifier.uri).toString() });
    }

    private async didOpen(fileUri: string): Promise<void> {
        const content: string = readFileSync(fileUri, { encoding: 'utf-8' });
		const didOpenParams = {
			textDocument: {
				uri: Uri.parse(fileUri).toString(),
				languageId: 'xml',
				version: 1,
				text: content
			}
		};
        await this.sendNotification("textDocument/didOpen", didOpenParams);
    }

    async getProjectStructure(path: string): Promise<ProjectStructureResponse> {
        return this.sendRequest('synapse/directoryTree', { uri: Uri.parse(path).toString() });
    }

    async getDefinition(document: TextDocumentIdentifier, position: Position): Promise<GoToDefinitionResponse> {
        return this.sendRequest('synapse/definition', { textDocument: document, position: position })
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
        return this.sendRequest("synapse/getSnippetCompletion", req);
    }
}
