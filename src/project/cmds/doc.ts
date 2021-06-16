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
    TM_EVENT_PROJECT_DOC, TM_EVENT_ERROR_EXECUTE_PROJECT_DOC, CMP_PROJECT_DOC, sendTelemetryEvent,
    sendTelemetryException
} from "../../telemetry";
import { runCommand, BALLERINA_COMMANDS, COMMAND_OPTIONS, MESSAGES, PROJECT_TYPE, PALETTE_COMMANDS } from "./cmd-runner";
import { getCurrentBallerinaProject } from "../../utils/project-utils";

enum DOC_OPTIONS { DOC_ALL = "build-all", DOC_MODULE = "build-module" }

function activateDocCommand() {
    // register ballerina doc handler
    commands.registerCommand(PALETTE_COMMANDS.DOC, async () => {
        try {
            sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_PROJECT_DOC, CMP_PROJECT_DOC);

            const currentProject = await getCurrentBallerinaProject();
            if (ballerinaExtInstance.isSwanLake()) {
                if (currentProject.kind === PROJECT_TYPE.SINGLE_FILE) {
                    sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_ERROR_EXECUTE_PROJECT_DOC, CMP_PROJECT_DOC,
                        MESSAGES.NOT_IN_PROJECT);
                    window.showErrorMessage(MESSAGES.NOT_IN_PROJECT);
                    return;
                }
                runCommand(currentProject, ballerinaExtInstance.getBallerinaCmd(), BALLERINA_COMMANDS.DOC, currentProject.path!);

            } else {
                if (currentProject.path) {
                    const docOptions = [{
                        description: "ballerina build <module-name>",
                        label: "Document Module",
                        id: DOC_OPTIONS.DOC_MODULE
                    }, {
                        description: "ballerina build --all",
                        label: "Document Project",
                        id: DOC_OPTIONS.DOC_ALL
                    }];

                    const userSelection = await window.showQuickPick(docOptions, {
                        placeHolder: MESSAGES.SELECT_OPTION
                    });

                    if (userSelection!.id === DOC_OPTIONS.DOC_MODULE) {
                        const moduleName = await window.showInputBox({ placeHolder: MESSAGES.MODULE_NAME });
                        if (moduleName && moduleName.trim().length > 0) {
                            runCommand(currentProject, ballerinaExtInstance.getBallerinaCmd(),
                                BALLERINA_COMMANDS.BUILD, moduleName);
                        }
                    }
                    if (userSelection!.id === DOC_OPTIONS.DOC_ALL) {
                        runCommand(currentProject, ballerinaExtInstance.getBallerinaCmd(), BALLERINA_COMMANDS.BUILD,
                            COMMAND_OPTIONS.ALL);
                    }

                } else {
                    sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_ERROR_EXECUTE_PROJECT_DOC, CMP_PROJECT_DOC,
                        MESSAGES.NOT_IN_PROJECT);
                    window.showErrorMessage(MESSAGES.NOT_IN_PROJECT);
                    return;
                }
            }

        } catch (error) {
            sendTelemetryException(ballerinaExtInstance, error, CMP_PROJECT_DOC);
            window.showErrorMessage(error);
        }
    });
}

export { activateDocCommand };
