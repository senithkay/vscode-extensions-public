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

import { ballerinaExtInstance } from "../../core";
import { commands, window } from "vscode";
import { outputChannel } from "../../utils";
import {
    TM_EVENT_PROJECT_CLOUD, TM_EVENT_ERROR_EXECUTE_PROJECT_CLOUD, CMP_PROJECT_CLOUD, sendTelemetryEvent,
    sendTelemetryException
} from "../../telemetry";
import { getCurrentBallerinaProject } from "../../utils/project-utils";
import { PALETTE_COMMANDS, PROJECT_TYPE } from "./cmd-runner";
import * as fs from 'fs';
import { sep } from 'path';

const CLOUD_CONFIG_FILE_NAME = `${sep}Cloud.toml`;

export function activateCloudCommand() {
    // register create Cloud.toml command handler
    commands.registerCommand(PALETTE_COMMANDS.CLOUD, async () => {
        try {
            sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_PROJECT_CLOUD, CMP_PROJECT_CLOUD);

            const currentProject = await getCurrentBallerinaProject();

            if (currentProject.kind !== PROJECT_TYPE.SINGLE_FILE) {
                if (currentProject.path) {
                    let cloudTomlPath = currentProject.path + CLOUD_CONFIG_FILE_NAME;
                    if (!fs.existsSync(cloudTomlPath)) {
                        const commandArgs =  {
                            key : "uri",
                            value : window.activeTextEditor!.document.uri.toString()
                        };
                        commands.executeCommand('ballerina.create.cloud.exec', commandArgs);
                        outputChannel.appendLine(`Cloud.toml created in ${currentProject.path}`);
                    } else {
                        const message = `Cloud.toml already exists in the project.`;
                        sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_ERROR_EXECUTE_PROJECT_CLOUD,
                            CMP_PROJECT_CLOUD, message);
                        window.showErrorMessage(message);
                    }
                }
            } else {
                const message = `Cloud.toml is not supported for single file projects.`;
                sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_ERROR_EXECUTE_PROJECT_CLOUD, CMP_PROJECT_CLOUD,
                    message);
                window.showErrorMessage(message);
            }
        } catch (error) {
            if (error instanceof Error) {
                sendTelemetryException(ballerinaExtInstance, error, CMP_PROJECT_CLOUD);
                window.showErrorMessage(error.message);
            } else {
                window.showErrorMessage("Unkown error occurred.");
            }
        }
    });
}
