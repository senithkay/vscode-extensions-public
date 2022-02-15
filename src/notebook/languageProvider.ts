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
    CompletionList, Disposable, DocumentSelector, DocumentSemanticTokensProvider, Event,
    languages, Position, ProviderResult, SemanticTokens, SemanticTokensLegend, TextDocument, Uri, 
    } from "vscode";
import { BAL_NOTEBOOK, NOTEBOOK_SCHEME } from "./constants";
import { createFile, deleteFile } from "./utils";

const selector: DocumentSelector = {
    scheme: NOTEBOOK_SCHEME,
    language: LANGUAGE.BALLERINA
}

const legend: SemanticTokensLegend = {
    tokenTypes: [],
    tokenModifiers: []
}
export class SemanticTokensProvider implements DocumentSemanticTokensProvider{
    onDidChangeSemanticTokens?: Event<void> | undefined;
    provideDocumentSemanticTokens(document: TextDocument, token: CancellationToken): 
    ProviderResult<SemanticTokens> {
        throw new Error("Method not implemented.");
    }
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
        let langClient: ExtendedLangClient | undefined = this.ballerinaExtension.langClient;

        if (!langClient) {
            return [];
        }
        let path: string = document.uri.path;
        let uri: Uri = Uri.parse(`file:${path.substring(0, path.length - BAL_NOTEBOOK.length)}_temp.bal`);
        await createFile(uri, document.getText());
        langClient.didOpen({
            textDocument: {
                uri: uri.toString(),
				languageId: LANGUAGE.BALLERINA,
				version: 1,
				text: document.getText()
			}
		});
        let completions = await langClient.getCompletion({
            textDocument: {
                uri: uri.toString()
            },
            position: {
                character: position.character,
                line: position.line
            },
            context: {
                triggerKind: context.triggerKind
            }
        });
        deleteFile(uri);
        return completions;
    }
}

export function registerLanguageProviders(ballerinaExtInstance: BallerinaExtension): Disposable{
    const disposables: Disposable[] = [];
    disposables.push(
        languages.registerDocumentSemanticTokensProvider(selector, new SemanticTokensProvider(), legend));
    disposables.push(
        languages.registerCompletionItemProvider(selector, new NotebookCompletionItemProvider(ballerinaExtInstance)));
    return Disposable.from(...disposables);
}