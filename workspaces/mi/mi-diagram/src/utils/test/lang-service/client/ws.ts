// tslint:disable-next-line:no-submodule-imports
import { ConnectionCloseHandler, ConnectionErrorHandler, createConnection } from "monaco-languageclient/lib/connection";
import * as rpc from "@codingame/monaco-jsonrpc";
import WebSocket from 'ws';

import { MILangClient } from "./client";
import { IMILangClient } from "./model";
// import WebSocket from 'ws';
// import { MILanguageClient } from "../../lang-client/activator";

export function createWSLangClient(
        port: number,
        errorHandler: ConnectionErrorHandler,
        closeHandler: ConnectionCloseHandler)
    : Thenable<IMILangClient> {

    console.log("port: ", port);
    let webSocket: any;

    try {
        webSocket = new WebSocket(`ws://127.0.0.1:${port}`);
    } catch (e) {
        console.error("Failed to create WebSocket:", e);
        throw e; // Rethrow the error after logging it
    }

    // Add event listeners to the WebSocket for better debugging
    // Immediate logging of the WebSocket object
    console.log("WebSocket created:", webSocket);
    webSocket.onopen = () => {
        console.log("WebSocket connection opened:", webSocket);
    };

    webSocket.onerror = (error: any) => {
        console.error("WebSocket error:", error);
    };

    webSocket.onclose = (event: any) => {
        console.log("WebSocket connection closed:", event);
    };
    return new Promise((resolve, reject) => {
        rpc.listen({
            onConnection: (connection: rpc.MessageConnection) => {
                const lsConnection = createConnection(connection, errorHandler, closeHandler);
                console.log("lsConnection: ", lsConnection);
                resolve(new MILangClient(lsConnection));
            },
            webSocket,
        });
    });
}
