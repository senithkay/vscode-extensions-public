import { ChildProcess } from "child_process";
import treekill from "tree-kill";

import { IMILangServer } from ".";
import { spawnStdioServer } from "./server";
import { detectJavaHome as detectJavaHome } from "./utils";

export class StdioBallerinaLangServer implements IMILangServer {

    public lsProcess: ChildProcess | undefined;

    constructor(
        private javaHome: string = detectJavaHome()
    ) {
    }

    public start(): void {
        this.lsProcess = spawnStdioServer(this.javaHome);
        console.log("LS Process started with PID: " + this.lsProcess.pid);
    }

    public shutdown(): void {
        if (this.lsProcess) {
            treekill(this.lsProcess.pid);
        }
    }
}
