import { ballerinaExtInstance } from "../../core";
import { commands, window } from "vscode";
import {
    TM_EVENT_PROJECT_BUILD, TM_EVENT_ERROR_EXECUTE_PROJECT_BUILD, CMP_PROJECT_BUILD, sendTelemetryEvent,
    sendTelemetryException
} from "../../telemetry";
import { runCommand, BALLERINA_COMMANDS, COMMAND_OPTIONS, MESSAGES, PROJECT_TYPE, PALETTE_COMMANDS } from "./cmd-runner";
import { getCurrentBallerinaProject, getCurrenDirectoryPath, getCurrentBallerinaFile }
    from "../../utils/project-utils";

enum BUILD_OPTIONS { BUILD_ALL = "build-all", BUILD_MODULE = "build-module" }

export function activateBuildCommand() {
    // register run project build handler
    commands.registerCommand(PALETTE_COMMANDS.BUILD, async () => {
        try {
            sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_PROJECT_BUILD, CMP_PROJECT_BUILD);

            const currentProject = await getCurrentBallerinaProject();
            if (ballerinaExtInstance.isSwanLake) {
                if (currentProject.kind !== PROJECT_TYPE.SINGLE_FILE) {
                    runCommand(currentProject, ballerinaExtInstance.getBallerinaCmd(), BALLERINA_COMMANDS.BUILD,
                        currentProject.path!);
                } else {
                    runCommand(getCurrenDirectoryPath(), ballerinaExtInstance.getBallerinaCmd(), BALLERINA_COMMANDS.BUILD,
                        getCurrentBallerinaFile());
                }

            } else if (ballerinaExtInstance.is12x) {
                const currentProject = await getCurrentBallerinaProject();
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
                        let moduleName;
                        do {
                            moduleName = await window.showInputBox({ placeHolder: MESSAGES.MODULE_NAME });
                        } while (!moduleName || moduleName && moduleName.trim().length === 0);
                        runCommand(currentProject, ballerinaExtInstance.getBallerinaCmd(), BALLERINA_COMMANDS.BUILD,
                            moduleName);
                    }

                    if (userSelection!.id === BUILD_OPTIONS.BUILD_ALL) {
                        runCommand(currentProject, ballerinaExtInstance.getBallerinaCmd(), BALLERINA_COMMANDS.BUILD,
                            COMMAND_OPTIONS.ALL);
                    }

                } else {
                    runCommand(getCurrenDirectoryPath(), ballerinaExtInstance.getBallerinaCmd(), BALLERINA_COMMANDS.BUILD,
                        getCurrentBallerinaFile());
                }

            } else {
                sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_ERROR_EXECUTE_PROJECT_BUILD, CMP_PROJECT_BUILD,
                    MESSAGES.NOT_SUPPORT);
                window.showErrorMessage(MESSAGES.NOT_SUPPORT);
            }

        } catch (error) {
            sendTelemetryException(ballerinaExtInstance, error, CMP_PROJECT_BUILD);
            window.showErrorMessage(error);
        }
    });
}