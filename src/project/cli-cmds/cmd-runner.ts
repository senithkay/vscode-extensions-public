import { BallerinaProject } from "../../core/extended-language-client";
import { getCLIOutputChannel } from "./output";
import { spawn } from "child_process";

export enum BALLERINA_COMMANDS {
    TEST = "test", BUILD = "build", FORMAT = "format", RUN = "run"
}

export function runCommand(file: BallerinaProject | string, cmd: BALLERINA_COMMANDS, ...args: string[]) {
    const outputChannel = getCLIOutputChannel();
    outputChannel.clear();
    outputChannel.show();
    let filePath = '';
    typeof file === 'string' ? filePath = file : filePath = file.path!;
    outputChannel.appendLine("executing command: ballerina " + cmd + " at " + filePath + "\n");
    const process = spawn("ballerina", [cmd, ...args], { cwd: filePath });
    process.stdout.on('data', (data) => {
        outputChannel.append(data.toString());
    });
    process.stderr.on('data', (data) => {
        outputChannel.append(data.toString());
    });
    process.on("exit", () => {
        outputChannel.appendLine("Finished ballerina " + cmd + " command execution.");
    });
}