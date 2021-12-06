import {
    ProtocolConnection,
} from 'vscode-languageserver-protocol';
import { LSConnection } from "./LSConnection";
import * as rpc from "vscode-ws-jsonrpc";
const WebSocket = require('isomorphic-ws');

export class WSConnection implements LSConnection {

    private _connection: ProtocolConnection;
    private _webSocket: WebSocket;

    private constructor(connection: any, webSocket: any) {
        this._connection = connection;
        this._webSocket = webSocket;
    }

    static initialize(url: string): Promise<WSConnection> {
        return new Promise((resolve, reject) => {
            const webSocket = new WebSocket(url);
            rpc.listen({
                webSocket,
                onConnection: (connection: rpc.MessageConnection) => {
                    resolve(new WSConnection(connection, webSocket));
                }
            });
        });
    }

    stop(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                this._webSocket.close();
            } catch (error) {
                console.log(error);
                reject();
            }
            resolve();
        });
    }


    getProtocolConnection(): ProtocolConnection {
        return this._connection;
    }

}