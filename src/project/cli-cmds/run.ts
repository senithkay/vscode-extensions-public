import { ballerinaExtInstance } from "../../core";
import { commands, window } from "vscode";
import { TM_EVENT_EXECUTE_BALLERINA_RUN, CMP_BALLERINA_RUN } from "../../telemetry";
import { runCommand, BALLERINA_COMMANDS } from "./cmd-runner";
import { getCurrentBallerinaProject, getCurrentBallerinaFile, getCurrenDirectoryPath } from "../../utils/project-utils";

function activateRunCommand() {
    const reporter = ballerinaExtInstance.telemetryReporter;

    // register ballerina run handler
    commands.registerCommand('ballerina.project.run', async () => {
        try {
            reporter.sendTelemetryEvent(TM_EVENT_EXECUTE_BALLERINA_RUN, { component: CMP_BALLERINA_RUN });

            const currentProject = await getCurrentBallerinaProject();
            if (currentProject.path) {
                const runOptions: { description: string, label: string, id: string }[] = [
                    {
                        description: "ballerina run <balfile>",
                        label: "Run the current file",
                        id: "run-file"
                    }, {
                        description: "ballerina run <module-name>",
                        label: "Run module",
                        id: "run-module"
                    }, {
                        description: "ballerina run --observability-included <module-name>",
                        label: "Run module with Choreo observability",
                        id: "run-module-observability"
                    }
                ];

                const userSelection = await window.showQuickPick(runOptions, { placeHolder: 'Select a run option.' });
                if (userSelection!.id === 'run-file') {
                    runCommand(getCurrenDirectoryPath(), BALLERINA_COMMANDS.RUN, getCurrentBallerinaFile());
                } else {
                    let moduleName;
                    do {
                        moduleName = await window.showInputBox({ placeHolder: 'Enter module name.' });
                    } while (!moduleName || moduleName && moduleName.trim().length === 0);

                    if (userSelection!.id === 'run-module') {
                        runCommand(currentProject, BALLERINA_COMMANDS.RUN, moduleName);
                    }

                    if (userSelection!.id === 'run-module-observability') {
                        runCommand(currentProject, BALLERINA_COMMANDS.RUN, '--observability-included', `${moduleName}`,
                            '--b7a.observability.enabled=true', '--b7a.observability.provider=choreo');
                    }
                }

            } else {
                runCommand(getCurrenDirectoryPath(), BALLERINA_COMMANDS.RUN, getCurrentBallerinaFile());
            }

        } catch (error) {
            reporter.sendTelemetryException(error, { component: CMP_BALLERINA_RUN });
            window.showErrorMessage(error);
        }
    });
}

export { activateRunCommand };
