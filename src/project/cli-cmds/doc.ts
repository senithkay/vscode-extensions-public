import { ballerinaExtInstance } from "../../core";
import { commands, window } from "vscode";
import {
    TM_EVENT_PROJECT_DOC, TM_EVENT_ERROR_EXECUTE_PROJECT_DOC, CMP_PROJECT_DOC, sendTelemetryEvent,
    sendTelemetryException
} from "../../telemetry";
import { runCommand, BALLERINA_COMMANDS, COMMAND_OPTIONS, MESSAGES, PROJECT_TYPE } from "./cmd-runner";
import { getCurrentBallerinaProject } from "../../utils/project-utils";

export enum DOC_OPTIONS { DOC_ALL = "build-all", DOC_MODULE = "build-module" }

function activateDocCommand() {
    // register ballerina doc handler
    commands.registerCommand('ballerina.project.doc', async () => {
        try {
            sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_PROJECT_DOC, CMP_PROJECT_DOC);

            const currentProject = await getCurrentBallerinaProject();
            if (ballerinaExtInstance.isSwanLake) {
                if (currentProject.kind === PROJECT_TYPE.SINGLE_FILE) {
                    sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_ERROR_EXECUTE_PROJECT_DOC, CMP_PROJECT_DOC,
                        MESSAGES.NOT_IN_PROJECT);
                    window.showErrorMessage(MESSAGES.NOT_IN_PROJECT);
                    return;
                }
                runCommand(currentProject, ballerinaExtInstance.ballerinaCmd, BALLERINA_COMMANDS.DOC, currentProject.path!);

            } else if (ballerinaExtInstance.is12x) {
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
                        let moduleName;
                        do {
                            moduleName = await window.showInputBox({ placeHolder: MESSAGES.MODULE_NAME });
                        } while (!moduleName || moduleName && moduleName.trim().length === 0);
                        runCommand(currentProject, ballerinaExtInstance.ballerinaCmd, BALLERINA_COMMANDS.BUILD,
                            moduleName);
                    }
                    if (userSelection!.id === DOC_OPTIONS.DOC_ALL) {
                        runCommand(currentProject, ballerinaExtInstance.ballerinaCmd, BALLERINA_COMMANDS.BUILD,
                            COMMAND_OPTIONS.ALL);
                    }

                } else {
                    sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_ERROR_EXECUTE_PROJECT_DOC, CMP_PROJECT_DOC,
                        MESSAGES.NOT_IN_PROJECT);
                    window.showErrorMessage(MESSAGES.NOT_IN_PROJECT);
                    return;
                }

            } else {
                sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_ERROR_EXECUTE_PROJECT_DOC, CMP_PROJECT_DOC,
                    MESSAGES.NOT_SUPPORT);
                window.showErrorMessage(MESSAGES.NOT_SUPPORT);
            }

        } catch (error) {
            sendTelemetryException(ballerinaExtInstance, error, CMP_PROJECT_DOC);
            window.showErrorMessage(error);
        }
    });
}

export { activateDocCommand };
