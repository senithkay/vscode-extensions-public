import { getLogger } from "../logger/logger";
import * as vscode from "vscode";
import { MessageConnection, Trace, Tracer } from "vscode-jsonrpc"
import { StdioConnection } from "./connection";
import { ProtocolConnection } from "vscode-languageserver-protocol";
import { UserInfo } from "@wso2-enterprise/choreo-core";

export function initRPCServer() {
    // (async () => {
    //     const client = await ChoreoRPCClient.getInstance();
    //     const resp = await client.conn.sendRequest("project/getProjectsByOrgID", { orgID: "3053" })
    //     console.log("Recieved response", resp);
    //     getLogger().debug("Recieved response", resp);
    // })();

    ChoreoRPCClient.getInstance().then(() => {
        console.log('Initialized Choreo RPC Client successfully')
        // client.conn.sendRequest("project/getProjectsByOrgID", { orgID: "3053" }).then((resp) => {
        //     console.log("Recieved response", resp);
        //     getLogger().debug(`Recieved response: ${JSON.stringify(resp)}`);
        // }).catch((err) => {
        //     console.error("Error while fetching projects", err);
        //     getLogger().error("Error while fetching projects", err);
        // });
    }).catch((err) => {
        console.error("Error while initializing rpc client", err);
        getLogger().error("Error while initializing rpc client", err);
    });

}

export class ChoreoRPCClient {
    private _conn: MessageConnection;
    private static _instance: ChoreoRPCClient;

    public constructor() {
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
        console.log("Received initialization response", resp);
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

    async getUserInfo(): Promise<UserInfo> {
        const client = await ChoreoRPCClient.getInstance();
        const response: {userInfo:UserInfo, isLoggedIn: boolean} = await client.conn.sendRequest("auth/getUserInfo");
        return response.userInfo;
    }
    
    async getSignInUrl(callbackUrl: string): Promise<string | void> {
        const client = await ChoreoRPCClient.getInstance();
        const response: {loginUrl: string} = await client.conn.sendRequest("auth/getSignInUrl", { callbackUrl });
        return response.loginUrl;
    }

    async signInWithAuthCode(authCode: string, orgId?: string): Promise<UserInfo | void> {
        const client = await ChoreoRPCClient.getInstance();
        const response: {userInfo:UserInfo} = await client.conn.sendRequest("auth/signInWithAuthCode", { authCode, orgId });
        return response.userInfo;
    }

    async signOut(): Promise<string | void> {
        const client = await ChoreoRPCClient.getInstance();
        await client.conn.sendRequest("auth/signOut");
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

