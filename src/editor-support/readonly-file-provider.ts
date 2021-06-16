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

import { BallerinaExtension, LANGUAGE } from "../core";
import { TextDocument, Uri, window, workspace } from "vscode";
import { ChildProcess, spawn } from "child_process";
import { debug, isWindows } from "../utils";

export class ReadOnlyFileProvider {

    ballerinaExtension: BallerinaExtension;

    constructor(ballerinaExtension: BallerinaExtension) {
        this.ballerinaExtension = ballerinaExtension;
    }

    markReadOnlyFiles() {
        workspace.onDidOpenTextDocument((document: TextDocument) => {
            if (document.languageId === LANGUAGE.BALLERINA && document.fileName.endsWith('.bal')
                && document.uri.toString().includes(Uri.file(this.ballerinaExtension.getBallerinaHome()).toString())) {
                this.updateFileAccess(document);
            }
        });
    }

    updateFileAccess(document: TextDocument): Promise<boolean> {
        return new Promise<boolean>((resolve, _reject) => {
            let command: string;
            let attribute: string;
            if (isWindows()) {
                command = "attrib";
                attribute = "+R";
            } else {
                command = "chmod";
                attribute = "u-w";
            }

            const childProcess: ChildProcess = spawn(command, [attribute, document.fileName]);

            childProcess.stdout.on("data", (data) => {
                debug(`Update file access: ${data}`);
            });

            childProcess.stderr.on("data", (data) => {
                debug(`Error occured while updating file access: ${data}`);
                if (!data.includes('Operation not permitted')) {
                    window.showErrorMessage(`Error at file access update: ${data}`);
                }
            });

            childProcess.on("close", (code) => {
                debug(`File access updating child process exited with code ${code}`);
                return resolve(true);
            });
        });
    }
}
