/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import { ExtendedLangClient } from '../core';
import {
    CodeLens, Range, window} from 'vscode';
import { SyntaxTree, Member } from '../diagram';
import { PALETTE_COMMANDS } from '../project';

interface Service {
    position: Position;
    name: string | undefined;
}

interface Position {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
}

interface Token {
    kind: string;
    value: string;
}

let langClient: ExtendedLangClient;

/**
 * Codelense provider for swagger view.
 */
export class TryOutCodeLensProvider {

    public async getCodeLensList(lClient: ExtendedLangClient): Promise<CodeLens[]> {
        langClient = lClient;
        let codeLenses: CodeLens[] = [];
        await this.findServices().then(services => {
            services.forEach(service => {
                codeLenses.push(this.createCodeLens(service));
            });
        }, _error => {
            return codeLenses;
        });
        return codeLenses;
    }

    private createCodeLens(service: Service): CodeLens {
        const position = service.position;
        const startLine = position.startLine;
        const startColumn = position.startColumn;
        const endLine = position.endLine;
        const endColumn = position.endColumn;

        const codeLens = new CodeLens(new Range(startLine, startColumn, endLine, endColumn));
        codeLens.command = {
            title: "Try it",
            tooltip: "Try running this service on swagger view",
            command: PALETTE_COMMANDS.SWAGGER_VIEW,
            arguments: [service.name]
        };
        return codeLens;
    }

    private async findServices(): Promise<Service[]> {
        const activeEditor = window.activeTextEditor;
        const services: Service[] = [];

        if (!activeEditor) {
            return services;
        }

        const uri = activeEditor.document.uri;
        if (!uri || !langClient) {
            return services;
        }

        await langClient.onReady().then(async () => {
            await langClient.getSyntaxTree({
                documentIdentifier: {
                    uri: uri.toString()
                }
            }).then(async (response) => {
                const syntaxTree: SyntaxTree = response.syntaxTree;
                if (!syntaxTree || !syntaxTree.members) {
                    return;
                }
                const members: Member[] = syntaxTree.members;
                for (const member of members) {
                    if (member.kind === 'ServiceDeclaration') {
                        const service = member as any;
                        if (service.typeDescriptor && service.typeDescriptor.modulePrefix && service.typeDescriptor.modulePrefix.value) {
                            // remove the try it for triggers
                            continue;
                        }
                        services.push({
                            position: service.serviceKeyword.position,
                            name: this.getResourcePath(service.absoluteResourcePath)
                        });
                    }
                }
            });
        });
        return services;
    }

    private getResourcePath(tokens: Token[]): string {
        let path = "";
        tokens.forEach((token) => {
            path += token.value;
        });
        return path;
    }
}
