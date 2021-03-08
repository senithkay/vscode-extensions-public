import { BallerinaProject } from "../../core/extended-language-client";
import { Terminal, window } from "vscode";

export enum BALLERINA_COMMANDS {
    TEST = "test", BUILD = "build", FORMAT = "format", RUN = "run", DOC = "doc", ADD = "add"
}

export enum PROJECT_TYPE {
    SINGLE_FILE = "SINGLE_FILE_PROJECT", BUILD_PROJECT = "BUILD_PROJECT", BALR_PROJECT = "BALR_PROJECT"
}

export enum COMMAND_OPTIONS {
    ALL = "--all"
}

export enum MESSAGES {
    NOT_SUPPORT = "Ballerina version is not supported by the VSCode plugin.",
    MODULE_NAME = "Enter module name.",
    SELECT_OPTION = "Select a build option.",
    NOT_IN_PROJECT = "Current file does not belong to a ballerina project."
}

let terminal: vscode.Terminal;
export function runCommand(file: BallerinaProject | string, executor: string, cmd: BALLERINA_COMMANDS, ...args: string[]) {
    if (terminal) {
        terminal.dispose();
    }
    let filePath = '';
    typeof file === 'string' ? filePath = file : filePath = file.path!;
    let argsList = '';
    if (args && args.length > 0) {
        args.forEach((arg) => {
            argsList += arg.concat(' ');
        });
    }
    terminal = vscode.window.createTerminal({ name: 'Terminal', cwd: filePath });
    terminal.show(true);
    terminal.sendText(`${executor} ${cmd} ${argsList}`, true);
}
