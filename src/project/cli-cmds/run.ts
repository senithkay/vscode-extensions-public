import { ballerinaExtInstance } from "../../core";
import { commands, window } from "vscode";
import {
    TM_EVENT_PROJECT_RUN, TM_EVENT_ERROR_EXECUTE_PROJECT_RUN, CMP_PROJECT_RUN, sendTelemetryEvent, sendTelemetryException
} from "../../telemetry";
import { runCommand, BALLERINA_COMMANDS, MESSAGES, PROJECT_TYPE, PALETTE_COMMANDS } from "./cmd-runner";
import { getCurrentBallerinaProject, getCurrentBallerinaFile, getCurrenDirectoryPath } from "../../utils/project-utils";

function activateRunCommand() {
    // register ballerina run handler
    commands.registerCommand(PALETTE_COMMANDS.RUN, async (...args: any[]) => {
        try {
            sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_PROJECT_RUN, CMP_PROJECT_RUN);
            if (window.activeTextEditor && window.activeTextEditor.document.isDirty) {
                await commands.executeCommand(PALETTE_COMMANDS.SAVE_ALL);
            }

            const currentProject = await getCurrentBallerinaProject();
            if (ballerinaExtInstance.isSwanLake && currentProject.kind !== PROJECT_TYPE.SINGLE_FILE) {
                runCommand(currentProject, ballerinaExtInstance.getBallerinaCmd(), BALLERINA_COMMANDS.RUN,
                    currentProject.path!, ...args);

            } else if (ballerinaExtInstance.is12x && currentProject.path) {
                const moduleName = await window.showInputBox({ placeHolder: MESSAGES.MODULE_NAME });
                if (moduleName && moduleName.trim().length > 0) {
                    runCommand(currentProject, ballerinaExtInstance.getBallerinaCmd(), BALLERINA_COMMANDS.RUN,
                        moduleName);
                }

            } else if (ballerinaExtInstance.isSwanLake || ballerinaExtInstance.is12x) {
                runCurrentFile();

            } else {
                sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_ERROR_EXECUTE_PROJECT_RUN, CMP_PROJECT_RUN, MESSAGES.NOT_SUPPORT);
                window.showErrorMessage(MESSAGES.NOT_SUPPORT);
            }

        } catch (error) {
            sendTelemetryException(ballerinaExtInstance, error, CMP_PROJECT_RUN);
            window.showErrorMessage(error);
        }
    });
}

function runCurrentFile() {
    runCommand(getCurrenDirectoryPath(), ballerinaExtInstance.getBallerinaCmd(), BALLERINA_COMMANDS.RUN, getCurrentBallerinaFile());
}

export { activateRunCommand };
