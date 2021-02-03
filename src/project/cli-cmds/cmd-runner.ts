import { BallerinaProject } from "../../core/extended-language-client";
import { getCLIOutputChannel } from "./output";
import { spawn, spawnSync } from "child_process";

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

export function runCommand(file: BallerinaProject | string, executor: string, cmd: BALLERINA_COMMANDS, ...args: string[]) {
    const outputChannel = getCLIOutputChannel();
    outputChannel.clear();
    outputChannel.show();
    let filePath = '';
    typeof file === 'string' ? filePath = file : filePath = file.path!;
    outputChannel.appendLine(`executing command: ${executor} ${cmd} at ${filePath}\n`);
    const process = spawn(executor, [cmd, ...args], { cwd: filePath });
    process.stdout.on('data', (data) => {
        outputChannel.append(data.toString());
    });
    process.stderr.on('data', (data) => {
        outputChannel.append(data.toString());
    });
    process.on("exit", () => {
        outputChannel.appendLine(`Finished ${executor} ${cmd} command execution.`);
    });
}

export function runCommandOnBackground(file: BallerinaProject | string, executor: string, cmd: BALLERINA_COMMANDS, ...args: string[]): boolean {
    let filePath = '';
    typeof file === 'string' ? filePath = file : filePath = file.path!;
    const result = spawnSync(executor, [cmd, ...args], { cwd: filePath });
    if (result.status === 0) {
        return true;
    }
    return false;
}