import { ChildProcess } from "child_process";
// tslint:disable:no-submodule-imports
import { ConnectionCloseHandler, ConnectionErrorHandler,
    createConnection } from "monaco-languageclient/lib/connection";
import { StreamMessageReader, StreamMessageWriter } from 'vscode-jsonrpc/node';
import { createMessageConnection } from "@codingame/monaco-jsonrpc";

import { MILangClient as MILangClient } from "./client";
import { IMILangClient } from "./model";

export function createStdioLangClient(cp: ChildProcess,
                                      errorHandler: ConnectionErrorHandler,
                                      closeHandler: ConnectionCloseHandler):
        Thenable<IMILangClient> {
    const reader = new StreamMessageReader(cp.stdout);
    const writer = new StreamMessageWriter(cp.stdin);
    const messageConntection = createMessageConnection(reader, writer);
    const lsConnection = createConnection(messageConntection, errorHandler, closeHandler);
    return Promise.resolve(new MILangClient(lsConnection));
}
