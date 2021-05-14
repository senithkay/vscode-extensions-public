import { ballerinaExtInstance } from "../../core";
import { commands, window } from "vscode";
import {
    TM_EVENT_PROJECT_TEST, TM_EVENT_ERROR_EXECUTE_PROJECT_TEST, CMP_PROJECT_TEST, sendTelemetryEvent,
    sendTelemetryException
} from "../../telemetry";
import { runCommand, BALLERINA_COMMANDS, COMMAND_OPTIONS, MESSAGES, PROJECT_TYPE, PALETTE_COMMANDS } from "./cmd-runner";
import { getCurrentBallerinaProject, getCurrentBallerinaFile, getCurrenDirectoryPath } from "../../utils/project-utils";

enum TEST_OPTIONS { TEST_ALL = "test-all", TEST_MODULE = "test-module" }

export function activateTestRunner() {
    // register run project tests handler
    commands.registerCommand(PALETTE_COMMANDS.TEST, async (...args: any[]) => {
        try {
            sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_PROJECT_TEST, CMP_PROJECT_TEST);
            if (window.activeTextEditor && window.activeTextEditor.document.isDirty) {
                await commands.executeCommand(PALETTE_COMMANDS.SAVE_ALL);
            }
            // get Ballerina Project path for current Ballerina file
            const currentProject = await getCurrentBallerinaProject();
            if (ballerinaExtInstance.isSwanLake) {
                if (currentProject.kind !== PROJECT_TYPE.SINGLE_FILE) {
                    runCommand(currentProject, ballerinaExtInstance.getBallerinaCmd(), BALLERINA_COMMANDS.TEST,
                        ...args, currentProject.path!);
                } else {
                    runCommand(getCurrenDirectoryPath(), ballerinaExtInstance.getBallerinaCmd(), BALLERINA_COMMANDS.TEST,
                        ...args, getCurrentBallerinaFile());
                }

            } else if (ballerinaExtInstance.is12x) {
                if (currentProject.path) {
                    const docOptions = [{
                        description: "ballerina build <module-name>",
                        label: "Test Module",
                        id: TEST_OPTIONS.TEST_MODULE
                    }, {
                        description: "ballerina build --all",
                        label: "Test Project",
                        id: TEST_OPTIONS.TEST_ALL
                    }];

                    const userSelection = await window.showQuickPick(docOptions, {
                        placeHolder: MESSAGES.SELECT_OPTION
                    });

                    if (userSelection!.id === TEST_OPTIONS.TEST_MODULE) {
                        const moduleName = await window.showInputBox({ placeHolder: MESSAGES.MODULE_NAME });
                        if (moduleName && moduleName.trim().length > 0) {
                            runCommand(currentProject, ballerinaExtInstance.getBallerinaCmd(), BALLERINA_COMMANDS.TEST,
                                moduleName);
                        }
                    }
                    if (userSelection!.id === TEST_OPTIONS.TEST_ALL) {
                        runCommand(currentProject, ballerinaExtInstance.getBallerinaCmd(), BALLERINA_COMMANDS.TEST,
                            COMMAND_OPTIONS.ALL);
                    }

                } else {
                    runCommand(getCurrenDirectoryPath(), ballerinaExtInstance.getBallerinaCmd(), BALLERINA_COMMANDS.TEST,
                        getCurrentBallerinaFile());
                }

            } else {
                sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_ERROR_EXECUTE_PROJECT_TEST, CMP_PROJECT_TEST,
                    MESSAGES.NOT_SUPPORT);
                window.showErrorMessage(MESSAGES.NOT_SUPPORT);
            }
        } catch (error) {
            sendTelemetryException(ballerinaExtInstance, error, CMP_PROJECT_TEST);
            window.showErrorMessage(error);
        }
    });
}
