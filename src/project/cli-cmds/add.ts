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
import {
    TM_EVENT_PROJECT_ADD, TM_EVENT_ERROR_EXECUTE_PROJECT_ADD, CMP_PROJECT_ADD, sendTelemetryEvent, sendTelemetryException
} from "../../telemetry";
import { runCommand, BALLERINA_COMMANDS, MESSAGES, PROJECT_TYPE, PALETTE_COMMANDS } from "./cmd-runner";
import { getCurrentBallerinaProject } from "../../utils/project-utils";

function activateAddCommand() {
    // register ballerina add handler
    commands.registerCommand(PALETTE_COMMANDS.ADD, async () => {
        try {
            sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_PROJECT_ADD, CMP_PROJECT_ADD);

            const currentProject = await getCurrentBallerinaProject();
            if (ballerinaExtInstance.isSwanLake && currentProject.kind === PROJECT_TYPE.SINGLE_FILE ||
                ballerinaExtInstance.is12x && !currentProject.path) {
                sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_ERROR_EXECUTE_PROJECT_ADD, CMP_PROJECT_ADD,
                    MESSAGES.NOT_IN_PROJECT);
                window.showErrorMessage(MESSAGES.NOT_IN_PROJECT);
                return;
            }

            if (ballerinaExtInstance.isSwanLake || ballerinaExtInstance.is12x) {
                let moduleName;
                do {
                    moduleName = await window.showInputBox({ placeHolder: MESSAGES.MODULE_NAME });
                } while (!moduleName || moduleName && moduleName.trim().length === 0);
                runCommand(currentProject, ballerinaExtInstance.getBallerinaCmd(), BALLERINA_COMMANDS.ADD, moduleName);
            } else {
                sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_ERROR_EXECUTE_PROJECT_ADD, CMP_PROJECT_ADD, MESSAGES.NOT_SUPPORT);
                window.showErrorMessage(MESSAGES.NOT_SUPPORT);
                return;
            }

        } catch (error) {
            sendTelemetryException(ballerinaExtInstance, error, CMP_PROJECT_ADD);
            window.showErrorMessage(error);
        }
    });
}

export { activateAddCommand };
