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

import { BallerinaProject, ballerinaExtInstance } from "../core";
import { window } from "vscode";
import * as path from 'path';
import { isSupportedVersion, VERSION } from "./config";

function getCurrentBallerinaProject(file?: string): Promise<BallerinaProject> {
    return new Promise((resolve, reject) => {
        const activeEditor = window.activeTextEditor;
        // if currently opened file is a bal file
        if (activeEditor || file) {
            // get path of the current bal file
            const uri = activeEditor ? activeEditor.document.uri.toString() : file!;
            if (ballerinaExtInstance.langClient && isSupportedVersion(ballerinaExtInstance, VERSION.BETA, 1)) {
                // get Ballerina Project path for current Ballerina file
                ballerinaExtInstance.langClient.getBallerinaProject({
                    documentIdentifier: {
                        uri,
                    }
                }).then((response) => {
                    const project = response as BallerinaProject;
                    if (!project.kind) {
                        reject(`Current file does not belong to a ballerina project.`);
                    }
                    resolve(project);
                }, _error => {
                    reject("Language Client is not available.");
                });
            } else {
                reject("Language Client is not available.");
            }
        } else {
            reject("There is no active editor.");
        }
    });
}

function getCurrentBallerinaFile(): string {
    const activeEditor = window.activeTextEditor;
    if (activeEditor && activeEditor.document.fileName.endsWith('.bal')) {
        return activeEditor.document.fileName.toString();
    }
    throw new Error("Current file is not a Ballerina file");
}

function getCurrenDirectoryPath(): string {
    const activeEditor = window.activeTextEditor;
    if (activeEditor) {
        return path.dirname(activeEditor.document.fileName);
    }
    throw new Error("There is no active editor");
}

export { getCurrentBallerinaProject, getCurrentBallerinaFile, getCurrenDirectoryPath };
