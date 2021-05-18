import { BallerinaProject } from "../../core/extended-language-client";
import { Terminal, window } from "vscode";

export enum PALETTE_COMMANDS {
    ADD = 'ballerina.project.add',
    BUILD = 'ballerina.project.build',
    CLOUD = 'ballerina.create.cloud',
    DOC = 'ballerina.project.doc',
    FOCUS_OVERVIEW = 'ballerinaPackageTreeView.focus',
    RUN = 'ballerina.project.run',
    SAVE_ALL = 'workbench.action.files.saveFiles',
    TEST = 'ballerina.project.test'
}

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

export const BAL_TOML = "Ballerina.toml";

let terminal: Terminal;
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
    terminal = window.createTerminal({ name: 'Terminal', cwd: filePath });
    terminal.sendText(process.platform === 'win32' ? 'cls' : 'clear', true);
    terminal.show(true);
    terminal.sendText(`${executor} ${cmd} ${argsList}`, true);
}

export function clearTerminal(): void {
    if (terminal) {
        terminal.dispose();
    }
}
