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
    await workspace.fs.writeFile(uri, new TextEncoder().encode(content));
    return;
}

export async function deleteFile(uri: Uri){
    if (existsSync(uri.fsPath)) {
        await workspace.fs.delete(uri);
    }
    return;
}

export async function addText(text: string,uri: Uri){
    await writeFileSync(uri.fsPath, text);
    return;
}

export function getPlainTextSnippet(snippet: string) {
    return snippet
            .replaceAll("\\$\\{\\d+:([^\\{^\\}]*)\\}", "$1")
            .replaceAll("(\\$\\{\\d+\\})", "");
}