import { createProtocolConnection, Logger, ProtocolConnection } from "vscode-languageserver-protocol";
import { StreamMessageReader, StreamMessageWriter } from 'vscode-jsonrpc/node'
import { ChildProcessWithoutNullStreams, spawn } from "child_process";

export class StdioConnection {
    private _connection: ProtocolConnection;
    private _lsProcess: ChildProcessWithoutNullStreams;
    constructor(private executable_path: string | undefined) {
        console.log("Starting RPC server, path:", this.executable_path);
        this._lsProcess = spawn(`./${this.executable_path}` || "choreo", ['start-rpc-server']);
        this._connection = createProtocolConnection(
            new StreamMessageReader(this._lsProcess.stdout),
            new StreamMessageWriter(this._lsProcess.stdin),
            new RPCServerLogger());
    }

    stop(): Promise<void> {
        return new Promise<void>((resolve) => {
            this._lsProcess.on("exit", () => {
                resolve();
            });
            this._lsProcess.kill();
        });
    }

    getProtocolConnection(): ProtocolConnection {
        return this._connection;
    }

    getChildProcess(): ChildProcessWithoutNullStreams {
        return this._lsProcess;
    }
}

class RPCServerLogger implements Logger {

    error(_message: string): void {
        // do nothing;
    }
    warn(_message: string): void {
        // do nothing
    }
    info(_message: string): void {
        // do nothing
    }
    log(_message: string): void {
        // do nothing
    }
}
