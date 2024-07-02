import { Server } from "ws";

import { IMILangServer } from "./model";
import { spawnWSServer } from "./server";
import { detectJavaHome } from "./utils";

export class WSMILangServer implements IMILangServer {

    private wsServer: Server | undefined;

    constructor(
        private port: number = 0,
        private javaHome: string = detectJavaHome()
    ) {
    }

    public start(): void {
        this.wsServer = spawnWSServer(this.javaHome, this.port);
    }

    public shutdown(): void {
        if (this.wsServer) {
            this.wsServer.removeAllListeners();
            this.wsServer.close();
        }
    }
}
