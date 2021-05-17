import { BallerinaExtension, LANGUAGE } from "../core";
import { TextDocument, Uri, window, workspace } from "vscode";
import { ChildProcess, spawn } from "child_process";
import { debug } from "../utils";

export class ReadOnlyFileProvider {

    ballerinaExtension: BallerinaExtension;

    constructor(ballerinaExtension: BallerinaExtension) {
        this.ballerinaExtension = ballerinaExtension;
    }

    markReadOnlyFiles() {
        workspace.onDidOpenTextDocument((document: TextDocument) => {
            if (document.languageId === LANGUAGE.BALLERINA && document.fileName.endsWith('.bal')
                && document.uri.toString().includes(Uri.file(this.ballerinaExtension.getBallerinaHome()).toString())) {
                this.updateFileAccess(document);
            }
        });
    }

    updateFileAccess(document: TextDocument): Promise<boolean> {
        return new Promise<boolean>((resolve, _reject) => {
            let command: string;
            let attribute: string;
            if (process.platform === "win32") {
                command = "attrib";
                attribute = "+R";
            } else {
                command = "chmod";
                attribute = "u-w";
            }

            const childProcess: ChildProcess = spawn(command, [attribute, document.fileName]);

            childProcess.stdout.on("data", (data) => {
                debug(`Update file access: ${data}`);
            });

            childProcess.stderr.on("data", (data) => {
                debug(`Error occured while updating file access: ${data}`);
                window.showErrorMessage(`Error at file access update: ${data}`);
            });

            childProcess.on("close", (code) => {
                debug(`File access updating child process exited with code ${code}`);
                return resolve(true);
            });
        });
    }
}
