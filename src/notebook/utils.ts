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

import { existsSync, writeFileSync } from "fs";
import { TextEncoder } from "util";
import { Uri, workspace } from "vscode";

export async function createFile(uri: Uri, content: string){
    return await workspace.fs.writeFile(uri, new TextEncoder().encode(content));
}

export async function deleteFile(uri: Uri){
    if (existsSync(uri.fsPath)) {
        return await workspace.fs.delete(uri);
    }
}

export async function addText(text: string,uri: Uri){
    return writeFileSync(uri.fsPath, text);
}

export function getPlainTextSnippet(snippet: string) {
    return snippet.replace(/\${\d+(:\S+)*}/g, "");
}

export function translateCompletionItemKind(kind: number) {
    return kind - 1;
}
