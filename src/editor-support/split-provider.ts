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

import { BallerinaExtension, SyntaxTreeNodeResponse } from "../core";
import { Disposable, Position, Range, TextDocumentChangeEvent, TextDocumentContentChangeEvent, window, workspace } from "vscode";
import { CMP_STRING_SPLIT, sendTelemetryEvent, TM_EVENT_STRING_SPLIT } from "../telemetry";
import { isWindows } from "../utils";

const newLine: string = isWindows() ? '\r\n' : '\n';
const STRING_LITERAL: string = 'STRING_LITERAL';

/**
 * Provides string split capablity upon new line event.
 */
export class StringSplitter {

    public updateDocument(event: TextDocumentChangeEvent) {
        const editor = window.activeTextEditor;
        if (!editor || !editor.document.fileName.endsWith('.bal') || event.contentChanges.length === 0 ||
            event.document.fileName.includes("extension-output-wso2.ballerina")) {
            return;
        }
        if (this instanceof BallerinaExtension) {
            // Add change for diagram edit callback
            this.getDocumentContext().didEditorChange({
                fileUri: editor.document.uri,
                startLine: editor.selection.active.line,
                startColumn: editor.selection.active.character
            });

            let documentChange: TextDocumentContentChangeEvent | undefined;
            event.contentChanges.forEach(change => {
                if (change.text.startsWith(newLine)) {
                    documentChange = change;
                }
            });

            if (!documentChange) {
                return;
            }

            const range: Range = documentChange!.range;
            const extension: BallerinaExtension = this;
            if (!this.langClient) {
                return;
            }

            this.langClient.getSyntaxTreeNode({
                documentIdentifier: {
                    uri: editor.document.uri.toString()
                },
                range: {
                    start: {
                        line: range.start.line,
                        character: range.start.character
                    },
                    end: {
                        line: range.end.line,
                        character: range.end.character
                    }
                }
            }).then((stResponse) => {
                const response = stResponse as SyntaxTreeNodeResponse;
                if (!response.kind) {
                    return;
                }
                if (response.kind === STRING_LITERAL) {
                    sendTelemetryEvent(extension, TM_EVENT_STRING_SPLIT, CMP_STRING_SPLIT);
                    editor.edit(editBuilder => {
                        const startPosition = new Position(range.start.line, range.start.character);
                        const nextLinePosition = new Position(range.start.line + 1, documentChange!.text.length - 1);
                        const endPosition = new Position(range.end.line + 1, documentChange!.text.indexOf('\n'));
                        editBuilder.insert(startPosition, `\" +${newLine}`);
                        editBuilder.insert(nextLinePosition, `\"`);
                        editBuilder.delete(new Range(startPosition, endPosition));
                    });
                }
            });
        }
    }
}

/**
 * Configures string split capability for the extension.
 */
export class StringSplitFeature implements Disposable {

    private disposables: Disposable[] = [];
    private provider: StringSplitter;
    private ballerinaExtInstance: BallerinaExtension;

    constructor(provider: StringSplitter, ballerinaExtInstance: BallerinaExtension) {
        this.provider = provider;
        this.ballerinaExtInstance = ballerinaExtInstance;
        workspace.onDidChangeTextDocument(this.provider.updateDocument, this.ballerinaExtInstance, this.disposables);
    }

    dispose() {
        this.disposables.forEach((disposable) => disposable.dispose());
    }
}
