import * as vscode from "vscode";
import { Trace, Tracer } from "vscode-jsonrpc"
import { StdioConnection } from "./connection";

export function initRPCServer() {
    const executablePath = vscode.workspace.getConfiguration().get<string>("cli.path");
    const stdioConnection = new StdioConnection(executablePath);
    const connection = stdioConnection.getProtocolConnection();
    connection.trace(Trace.Verbose, new TestTracer());
    connection.listen();
    (async () => {

        const resp = await connection.sendRequest<{}>("initialize", {
            clientName: "vscode",
            clientVersion: "1.0.0",
        });

        const resp2 = await connection.sendRequest<{}>("initialize", {
            clientName: "vscode",
            clientVersion: "1.0.0",
        });
        console.log("Response from RPC server", resp);

    })();
}

export class TestTracer implements Tracer {
    log(message: string, verbose?: string): void {
        console.log(message, verbose);
    }
}
