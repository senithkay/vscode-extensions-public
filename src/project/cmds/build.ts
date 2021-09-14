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
    TM_EVENT_PROJECT_BUILD, CMP_PROJECT_BUILD, sendTelemetryEvent, sendTelemetryException
} from "../../telemetry";
import { runCommand, BALLERINA_COMMANDS, COMMAND_OPTIONS, MESSAGES, PROJECT_TYPE, PALETTE_COMMANDS }
    from "./cmd-runner";
import { getCurrentBallerinaProject, getCurrenDirectoryPath, getCurrentBallerinaFile }
    from "../../utils/project-utils";

enum BUILD_OPTIONS { BUILD_ALL = "build-all", BUILD_MODULE = "build-module" }

export function activateBuildCommand() {
    // register run project build handler
    commands.registerCommand(PALETTE_COMMANDS.BUILD, async () => {
        try {
            sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_PROJECT_BUILD, CMP_PROJECT_BUILD);

            const currentProject = await getCurrentBallerinaProject();
            if (ballerinaExtInstance.isSwanLake()) {
                if (currentProject.kind !== PROJECT_TYPE.SINGLE_FILE) {
                    runCommand(currentProject, ballerinaExtInstance.getBallerinaCmd(), BALLERINA_COMMANDS.BUILD,
                        currentProject.path!);
                } else {
                    runCommand(getCurrenDirectoryPath(), ballerinaExtInstance.getBallerinaCmd(),
                        BALLERINA_COMMANDS.BUILD, getCurrentBallerinaFile());
                }
            } else {
                if (currentProject.path) {
                    const buildOptions = [{
                        description: "ballerina build <module-name>",
                        label: "Build Module",
                        id: BUILD_OPTIONS.BUILD_MODULE
                    }, {
                        description: "ballerina build --all",
                        label: "Build Project",
                        id: BUILD_OPTIONS.BUILD_ALL
                    }];

                    const userSelection = await window.showQuickPick(buildOptions, {
                        placeHolder: MESSAGES.SELECT_OPTION
                    });

                    if (userSelection!.id === BUILD_OPTIONS.BUILD_MODULE) {
                        const moduleName = await window.showInputBox({ placeHolder: MESSAGES.MODULE_NAME });
                        if (moduleName && moduleName.trim().length > 0) {
                            runCommand(currentProject, ballerinaExtInstance.getBallerinaCmd(),
                                BALLERINA_COMMANDS.BUILD, moduleName);
                        }
                    }

                    if (userSelection!.id === BUILD_OPTIONS.BUILD_ALL) {
                        runCommand(currentProject, ballerinaExtInstance.getBallerinaCmd(), BALLERINA_COMMANDS.BUILD,
                            COMMAND_OPTIONS.ALL);
                    }

                } else {
                    runCommand(getCurrenDirectoryPath(), ballerinaExtInstance.getBallerinaCmd(),
                        BALLERINA_COMMANDS.BUILD, getCurrentBallerinaFile());
                }
            }

        } catch (error) {
            if (error instanceof Error) {
                sendTelemetryException(ballerinaExtInstance, error, CMP_PROJECT_BUILD);
                window.showErrorMessage(error.message);
            } else {
                window.showErrorMessage("Unkown error occurred.");
            }
        }
    });
}
