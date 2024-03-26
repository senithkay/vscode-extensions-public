import { getLogger } from "../logger/logger";
import * as vscode from "vscode";
import { MessageConnection, Trace, Tracer } from "vscode-jsonrpc"
import { StdioConnection } from "./connection";
import { ProtocolConnection } from "vscode-languageserver-protocol";

export function initRPCServer() {
    // (async () => {
    //     const client = await ChoreoRPCClient.getInstance();
    //     const resp = await client.conn.sendRequest("projects/getProjectsByOrgID", { orgID: "3053" })
    //     console.log("Recieved response", resp);
    //     getLogger().debug("Recieved response", resp);
    // })();

    ChoreoRPCClient.getInstance().then((client) => {
        client.conn.sendRequest("projects/getProjectsByOrgID", { orgID: "3053" }).then((resp) => {
            console.log("Recieved response", resp);
            getLogger().debug(`Recieved response: ${JSON.stringify(resp)}`);
        }).catch((err) => {
            console.error("Error while fetching projects", err);
            getLogger().error("Error while fetching projects", err);
        });
    }).catch((err) => {
        console.error("Error while initializing rpc client", err);
        getLogger().error("Error while initializing rpc client", err);
    });

}

export class ChoreoRPCClient {
    private _conn: MessageConnection;
    private static _instance: ChoreoRPCClient;

    private constructor() {
        getLogger().debug("Activating choreo rpc server")
        const executablePath = vscode.workspace.getConfiguration().get<string>("cli.path");
        const stdioConnection = new StdioConnection(executablePath);
        this._conn = stdioConnection.getProtocolConnection();
    }

    async init() {
        this._conn.trace(Trace.Verbose, new ChoreoTracer());
        this._conn.listen();
        // todo: send proper version

        const resp = await this._conn.sendRequest<{}>("initialize", { clientName: "vscode", clientVersion: "1.0.0" });
        console.log("Recieved initialization response", resp);
        // TODO: handle validations with versions
    }

    static async getInstance(): Promise<ChoreoRPCClient> {
        if (ChoreoRPCClient._instance) {
            return ChoreoRPCClient._instance;
        }

        ChoreoRPCClient._instance = new ChoreoRPCClient();
        await ChoreoRPCClient._instance.init();
        return ChoreoRPCClient._instance;
    }

    get conn(): MessageConnection {
        return this._conn;
    }
}

export class ChoreoTracer implements Tracer {
    log(dataObject: any): void {
        console.log(dataObject);
    }
    // log(message: string, verbose?: string): void {
    //     console.log(message, verbose);
    // }
}

