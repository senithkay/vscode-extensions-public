import {
    createProtocolConnection, ProtocolConnection
} from 'vscode-languageserver-protocol';
// tslint:disable-next-line: no-submodule-imports
import { StreamMessageReader, StreamMessageWriter } from 'vscode-jsonrpc/node'
import { BLCLogger } from "./BLCLogger";
import { LSConnection } from "./LSConnection";
import { ChildProcess, spawn } from "child_process";


export class StdioConnection implements LSConnection {

    private _connection: ProtocolConnection;
    private _lsProcess: any;

    constructor(balHome?: string) {
        this._lsProcess = spawn('bal', ['start-language-server']);
        this._connection = createProtocolConnection(
            new StreamMessageReader(this._lsProcess.stdout),
            new StreamMessageWriter(this._lsProcess.stdin),
            new BLCLogger());
    }

    stop(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._lsProcess.kill('SIGINT');
            this._lsProcess.on("exit", () => {
                resolve();
            })
        });
    }


    getProtocolConnection(): ProtocolConnection {
        return this._connection;
    }

    getChildProcess(): ChildProcess {
        return this._lsProcess;
    }
}
