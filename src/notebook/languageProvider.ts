/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import { BallerinaExtension, ExtendedLangClient, LANGUAGE } from "../core";
import { CancellationToken, CompletionContext, CompletionItem, CompletionItemProvider, 
    CompletionList, Disposable, DocumentSelector, languages, Position, ProviderResult, 
    TextDocument, Uri, } from "vscode";
import { NOTEBOOK_SCHEME } from "./constants";
import { addText, deleteFile } from "./utils";

const selector: DocumentSelector = {
    scheme: NOTEBOOK_SCHEME,
    language: LANGUAGE.BALLERINA
}

export class NotebookCompletionItemProvider implements CompletionItemProvider{
    private ballerinaExtension: BallerinaExtension;

    constructor(extensionInstance: BallerinaExtension) {
        this.ballerinaExtension = extensionInstance;
    }

    provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, 
        context: CompletionContext): ProviderResult<CompletionItem[] | CompletionList<CompletionItem>> {
            if (this.ballerinaExtension.langClient ) {
                return this.getCodeCompletionList(document, position, context);
            }
            return [];
    }

    private async getCodeCompletionList(document: TextDocument, position: Position, context: CompletionContext): 
        Promise<any> {
        let langClient: ExtendedLangClient = <ExtendedLangClient>this.ballerinaExtension.langClient;

        if (!langClient) {
            return [];
        }
        let {content, filePath} = await langClient.getShellBufferFilePath();
        performDidOpen(langClient, filePath, content);
        let endPositionOfMain = await this.getEndPositionOfMain(langClient, filePath);
        if (!endPositionOfMain) {
            deleteFile(Uri.parse(filePath));
            return [];
        }
        let textToWrite = content.substring(0, content.length - 1) + document.getText() + '\n}';
        await addText(textToWrite, Uri.parse(filePath));
        performDidOpen(langClient, filePath, textToWrite);
        let completions = await langClient.getCompletion({
            textDocument: {
                uri: filePath
            },
            position: {
                character: endPositionOfMain.character + position.character,
                line: endPositionOfMain.line + position.line
            },
            context: {
                triggerKind: context.triggerKind
            }
        });
        return completions;
    }

    private async getEndPositionOfMain(langClient: ExtendedLangClient, filePath: string) {
        let endPositionOfMain;
        let syntaxTree = await langClient.getSyntaxTree({
            documentIdentifier: {
                uri: filePath
            }
        });
        if (syntaxTree && syntaxTree.syntaxTree && syntaxTree.syntaxTree.members) {
            syntaxTree.syntaxTree.members.forEach(member => {
                if (member.kind == 'FunctionDefinition' && member.functionName.value == 'main') {
                    endPositionOfMain = {
                        line: member.position.endLine,
                        character: member.position.endColumn - 1
                    };
                }
            });
        }
        return endPositionOfMain;
    }
}

export function registerLanguageProviders(ballerinaExtInstance: BallerinaExtension): Disposable{
    const disposables: Disposable[] = [];
    disposables.push(
        languages.registerCompletionItemProvider(selector, new NotebookCompletionItemProvider(ballerinaExtInstance)));
    return Disposable.from(...disposables);
}

function performDidOpen(langClient: ExtendedLangClient, filePath: string, content: string) {
    langClient.didOpen({
        textDocument: {
            uri: filePath,
            languageId: LANGUAGE.BALLERINA,
            version: 1,
            text: content
        }
    });
}
