import { StreamMessageReader, StreamMessageWriter, createMessageConnection, MessageConnection } from 'vscode-jsonrpc/node'
import { ChildProcessWithoutNullStreams, spawn } from "child_process";

export class StdioConnection {
    private _connection: MessageConnection;
    private _serverProcess: ChildProcessWithoutNullStreams;
    constructor(private executable_path: string | undefined) {
        console.log("Starting RPC server, path:", this.executable_path);
        this._serverProcess = spawn(`${this.executable_path}` || "choreo", ['start-rpc-server']);
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

