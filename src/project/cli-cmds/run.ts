import { ballerinaExtInstance } from "../../core";
import { commands, window } from "vscode";
import { TM_EVENT_EXECUTE_BALLERINA_RUN, CMP_BALLERINA_RUN } from "../../telemetry";
import { runCommand, BALLERINA_COMMANDS } from "./cmd-runner";
import { getCurrentBallerinaProject, getCurrentBallerinaFile, getCurrenDirectoryPath } from "./utils";

function activateRunCommand() {
    const reporter = ballerinaExtInstance.telemetryReporter;

    // register ballerina run handler
    commands.registerCommand('ballerina.project.run', async () => {
        try {
            reporter.sendTelemetryEvent(TM_EVENT_EXECUTE_BALLERINA_RUN, { component: CMP_BALLERINA_RUN });

            const runOptions = [
                {
                    "description": "ballerina run <balfile>",
                    "label": "Run on current file",
                    "id": "run-file"
                },
                {
                    "description": "ballerina run <module-name>",
                    "label": "Run on module",
                    "id": "run-module"
                }
            ];
            const userSelection = await window.showQuickPick(runOptions, { placeHolder: 'Select a run option.' });
            if (userSelection!.id === 'run-file') {
                runCommand(getCurrenDirectoryPath(), BALLERINA_COMMANDS.RUN, getCurrentBallerinaFile());
            }
            if (userSelection!.id === 'run-module') {
                let moduleName;
                do {
                    moduleName = await window.showInputBox({ placeHolder: 'Enter module name.' });
                } while (!moduleName || moduleName && moduleName.trim().length === 0);
                const currentProject = await getCurrentBallerinaProject();
                runCommand(currentProject, BALLERINA_COMMANDS.TEST, moduleName);
            }
        } catch (error) {
            reporter.sendTelemetryException(error, { component: CMP_BALLERINA_RUN });
            window.showErrorMessage(error);
        }
    });
}

export { activateRunCommand };
