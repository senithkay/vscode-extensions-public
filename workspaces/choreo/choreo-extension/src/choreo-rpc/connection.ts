import { StreamMessageReader, StreamMessageWriter, createMessageConnection, MessageConnection } from 'vscode-jsonrpc/node'
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import * as os from 'os'
import { getLogger } from '../logger/logger';
import * as path from 'path';
import { workspace } from 'vscode';
import { getChoreoEnv, getChoreoExecPath } from './cli-install';



export class StdioConnection {
    private _connection: MessageConnection;
    private _serverProcess: ChildProcessWithoutNullStreams;
    constructor() {
        const executablePath = getChoreoExecPath();
        console.log("Starting RPC server, path:", executablePath);
        getLogger().debug("Starting RPC server" + executablePath);
        this._serverProcess = spawn(executablePath, ['start-rpc-server'], {
            env: {
                ...process.env,
                "CHOREO_ENV": getChoreoEnv(),
            }
        });
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

