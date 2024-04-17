import { StreamMessageReader, StreamMessageWriter, createMessageConnection, MessageConnection } from 'vscode-jsonrpc/node'
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import * as os from 'os'
import { getLogger } from '../logger/logger';

export class StdioConnection {
    private _connection: MessageConnection;
    private _serverProcess: ChildProcessWithoutNullStreams;
    constructor(private executable_path: string | undefined) {
        console.log("Starting RPC server, path:", this.executable_path);

        const homeDir = os.homedir();
        // generate the path for the executable based on the platform
        let userHome = homeDir;
        let pathSeparator = "/";
        if (process.platform === "win32") {
            userHome = process.env.USERPROFILE || homeDir;
            pathSeparator = "\\";
        }

        let genPath = `${userHome}${pathSeparator}.choreo${pathSeparator}bin${pathSeparator}choreo`;

        if (this.executable_path && this.executable_path !== "") {
            genPath = this.executable_path;
        }

        getLogger().debug("Starting RPC server" + genPath);

        this._serverProcess = spawn(genPath, ['start-rpc-server']);
        this._connection = createMessageConnection(
            new StreamMessageReader(this._serverProcess.stdout),
            new StreamMessageWriter(this._serverProcess.stdin));
    }

    stop(): Promise<void> {
        return new Promise<void>((resolve) => {
            this._serverProcess.on("exit", () => {
                resolve();
            });
            this._serverProcess.kill();
        });
    }

    getProtocolConnection(): MessageConnection {
        return this._connection;
    }

    getChildProcess(): ChildProcessWithoutNullStreams {
        return this._serverProcess;
    }
}

