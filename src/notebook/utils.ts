/**
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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

import { CompletionItemKind as MonacoCompletionItemKind } from "monaco-languageclient";
import { CompletionItemKind as VSCodeCompletionItemKind, Uri, workspace } from "vscode";
import { CompletionResponse } from "@wso2-enterprise/ballerina-low-code-editor";
import { TextEncoder } from "util";

export function getPlainTextSnippet(snippet: string) {
    return snippet.replace(/\${\d+(:\S+)*}/g, "");
}

export function translateCompletionItemKind(kind: MonacoCompletionItemKind) {
    return (kind - 1) as VSCodeCompletionItemKind;
}

export function filterCompletions(completions: CompletionResponse[]): CompletionResponse[] {
    const labelsUsedInShell = [
        "__last__", "__java_recall(handle context_id, handle name)", "__memorize(string name, any|error value)",
        "main()", "init()", "__run()", "__recall_any_error(string name)", "__recall_any(string name)",
        "__java_memorize(handle context_id, handle name, any|error value)", "__stmts()",
    ];
    return completions.filter(item => !labelsUsedInShell.includes(item.label));
}

export async function createFile(uri: Uri, content: string) {
    await workspace.fs.writeFile(uri, new TextEncoder().encode(content));
    return;
}
