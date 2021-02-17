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
import { getTelemetryProperties, TM_EVENT_EXECUTE_BALLERINA_ADD, CMP_BALLERINA_ADD } from "../../telemetry";
import { runCommand, BALLERINA_COMMANDS, MESSAGES, PROJECT_TYPE } from "./cmd-runner";
import { getCurrentBallerinaProject } from "../../utils/project-utils";

function activateAddCommand() {
    const reporter = ballerinaExtInstance.telemetryReporter;

    // register ballerina add handler
    commands.registerCommand('ballerina.project.add', async () => {
        try {
            reporter.sendTelemetryEvent(TM_EVENT_EXECUTE_BALLERINA_ADD, getTelemetryProperties(ballerinaExtInstance, CMP_BALLERINA_ADD));

            const currentProject = await getCurrentBallerinaProject();
            if (ballerinaExtInstance.isSwanLake && currentProject.kind === PROJECT_TYPE.SINGLE_FILE ||
                ballerinaExtInstance.is12x && !currentProject.path) {
                window.showErrorMessage(MESSAGES.NOT_IN_PROJECT);
                return;
            }

            if (ballerinaExtInstance.isSwanLake || ballerinaExtInstance.is12x) {
                let moduleName;
                do {
                    moduleName = await window.showInputBox({ placeHolder: MESSAGES.MODULE_NAME });
                } while (!moduleName || moduleName && moduleName.trim().length === 0);
                runCommand(currentProject, ballerinaExtInstance.ballerinaCmd, BALLERINA_COMMANDS.ADD, moduleName);
            } else {
                window.showErrorMessage(MESSAGES.NOT_SUPPORT);
                return;
            }

        } catch (error) {
            reporter.sendTelemetryException(error, getTelemetryProperties(ballerinaExtInstance, CMP_BALLERINA_ADD));
            window.showErrorMessage(error);
        }
    });
}

export { activateAddCommand };
