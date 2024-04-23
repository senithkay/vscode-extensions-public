/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { GetAvailableResourcesRequest, GetAvailableResourcesResponse, GetDefinitionRequest, GetDefinitionResponse, GetDiagnosticsReqeust, GetDiagnosticsResponse, ProjectStructureResponse, GetAvailableConnectorRequest, GetAvailableConnectorResponse, UpdateConnectorRequest, GetConnectorConnectionsRequest, GetConnectorConnectionsResponse } from "@wso2-enterprise/mi-core";
import { readFileSync } from "fs";
import { CancellationToken, FormattingOptions, Position, Range, Uri, workspace } from "vscode";
import { CompletionParams, LanguageClient, TextEdit } from "vscode-languageclient/node";
import { TextDocumentIdentifier } from "vscode-languageserver-protocol";
import * as fs from 'fs';
import * as vscode from 'vscode';

export interface GetSyntaxTreeParams {
    documentIdentifier: TextDocumentIdentifier;
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

export interface RangeFormatParams {
    textDocument: TextDocumentIdentifier;
    range: vscode.Range;
    options: FormattingOptions;
    workDoneToken: CancellationToken;
}

export class ExtendedLanguageClient extends LanguageClient {

    async getSyntaxTree(req: GetSyntaxTreeParams): Promise<GetSyntaxTreeResponse> {
        this.didOpen(req.documentIdentifier.uri);
        return this.sendRequest('synapse/syntaxTree', { uri: Uri.parse(req.documentIdentifier.uri).toString() });
    }

    private async didOpen(fileUri: string): Promise<void> {
        if (fs.existsSync(fileUri) && fs.lstatSync(fileUri).isFile()) {
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
    }

    async getProjectStructure(path: string): Promise<ProjectStructureResponse> {
        return this.sendRequest('synapse/directoryTree', { uri: Uri.parse(path).toString() });
    }

    async getRegistryFiles(req: string): Promise<string[]> {
        return this.sendRequest("synapse/getRegistryFiles", { uri: Uri.parse(req).toString() });
    }

    async getArifactFiles(req: string): Promise<string[]> {
        return this.sendRequest("synapse/getArtifactFiles", { uri: Uri.parse(req).toString() });
    }

    async getDefinition(params: GetDefinitionRequest): Promise<GetDefinitionResponse> {
        const doc = params.document;
        doc.uri = Uri.parse(doc.uri).toString();

        return this.sendRequest('synapse/definition', {
            textDocument: doc,
            position: params.position
        })
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

    async getAvailableResources(req: GetAvailableResourcesRequest): Promise<GetAvailableResourcesResponse> {
        let uri: string | undefined;
        if(req.documentIdentifier){
            uri = Uri.parse(req.documentIdentifier).toString();
        }
        return this.sendRequest("synapse/availableResources", { documentIdentifier: { uri: uri }, "resourceType": req.resourceType });
    }

    async getDiagnostics(req: GetDiagnosticsReqeust): Promise<GetDiagnosticsResponse> {
        return this.sendRequest("synapse/diagnostic", { uri: Uri.parse(req.documentUri).toString() });
    }

    async rangeFormat(req: RangeFormatParams): Promise<vscode.TextEdit[]> {
        return this.sendRequest("textDocument/rangeFormatting", req)
    }

    async getAvailableConnectors(req: GetAvailableConnectorRequest): Promise<GetAvailableConnectorResponse> {
        return this.sendRequest("synapse/availableConnectors", { documentIdentifier: { uri: Uri.parse(req.documentUri).toString() }, "connectorName": req.connectorName });
    }

    async updateConnectors(req: UpdateConnectorRequest): Promise<void> {
        return this.sendNotification("synapse/updateConnectors", { uri: Uri.parse(req.documentUri).toString() });
    }

    async getConnectorConnections(req: GetConnectorConnectionsRequest): Promise<GetConnectorConnectionsResponse> {
        return this.sendRequest("synapse/connectorConnections", { documentIdentifier: { uri: Uri.parse(req.documentUri).toString() }, "connectorName": req.connectorName });
    }
}
