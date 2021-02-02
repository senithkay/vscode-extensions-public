import { ballerinaExtInstance } from "../../core";
import { commands, window } from "vscode";
import { TM_EVENT_EXECUTE_BALLERINA_RUN, CMP_BALLERINA_RUN } from "../../telemetry";
import { runCommand, BALLERINA_COMMANDS, MESSAGES, PROJECT_TYPE } from "./cmd-runner";
import { getCurrentBallerinaProject, getCurrentBallerinaFile, getCurrenDirectoryPath } from "../../utils/project-utils";

export enum RUN_OPTIONS { RUN_MODULE = "run-module" }

function activateRunCommand() {
    const reporter = ballerinaExtInstance.telemetryReporter;

    // register ballerina run handler
    commands.registerCommand('ballerina.project.run', async () => {
        try {
            reporter.sendTelemetryEvent(TM_EVENT_EXECUTE_BALLERINA_RUN, { component: CMP_BALLERINA_RUN });

            const currentProject = await getCurrentBallerinaProject();
            if (ballerinaExtInstance.isSwanLake && currentProject.kind !== PROJECT_TYPE.SINGLE_FILE) {
                runCommand(currentProject, ballerinaExtInstance.ballerinaCmd, BALLERINA_COMMANDS.RUN,
                    currentProject.path!);

            } else if (ballerinaExtInstance.is12x && currentProject.path) {
                let moduleName;
                do {
                    moduleName = await window.showInputBox({ placeHolder: MESSAGES.MODULE_NAME });
                } while (!moduleName || moduleName && moduleName.trim().length === 0);
                runCommand(currentProject, ballerinaExtInstance.ballerinaCmd, BALLERINA_COMMANDS.RUN,
                    moduleName);

            } else if (ballerinaExtInstance.isSwanLake || ballerinaExtInstance.is12x) {
                runCurrentFile();

            } else {
                window.showErrorMessage(MESSAGES.NOT_SUPPORT);
            }

        } catch (error) {
            reporter.sendTelemetryException(error, { component: CMP_BALLERINA_RUN });
            window.showErrorMessage(error);
        }
    });
}

function runCurrentFile() {
    runCommand(getCurrenDirectoryPath(), ballerinaExtInstance.ballerinaCmd, BALLERINA_COMMANDS.RUN, getCurrentBallerinaFile());
}

export { activateRunCommand };
