import { getLogger } from "../logger/logger";
import { MessageConnection, Trace, Tracer } from "vscode-jsonrpc";
import { StdioConnection } from "./connection";
import { Buildpack, ComponentKind, Project, UserInfo, IChoreoRPCClient, BuildPackReq, GetBranchesReq, IsRepoAuthorizedReq, GetComponentsReq, CreateLinkReq, CreateProjectReq, CreateComponentReq, DeleteCompReq } from "@wso2-enterprise/choreo-core";
import { workspace } from "vscode";

export class RPCClient {
    private _conn: MessageConnection | undefined;
    private static _instance: RPCClient;

    private constructor() {
    }

    async init() {
        getLogger().debug("Activating choreo rpc server");
        const executablePath = workspace.getConfiguration().get<string>("cli.path");
        const stdioConnection = new StdioConnection(executablePath);
        this._conn = stdioConnection.getProtocolConnection();
        this._conn.trace(Trace.Verbose, new ChoreoTracer());
        this._conn.listen();
        // todo: send proper version

        try {
            const resp = await this._conn.sendRequest<{}>("initialize", { clientName: "vscode", clientVersion: "1.0.0" });
            console.log("Initialized RPC server", resp);
        } catch (e) {
            getLogger().error("failed to initialize rpc client", e);
        }
        // TODO: handle validations with versions
    }

    static async getInstance(): Promise<RPCClient> {
        if (RPCClient._instance) {
            return RPCClient._instance;
        }

        RPCClient._instance = new RPCClient();
        await RPCClient._instance.init();
        return RPCClient._instance;
    }

    get conn(): MessageConnection {
        if (!this._conn) {
            throw new Error("Connection is not initialized");
        }
        return this._conn;
    }
}

export class ChoreoRPCClient implements IChoreoRPCClient {
    private client: RPCClient | undefined;

    public constructor() {
        RPCClient.getInstance().then((client) => {
            this.client = client;
        }).catch((err) => {
            getLogger().error("Error initializing RPC client", err);
        });
    }


    async createProject(params: CreateProjectReq): Promise<Project> {
        if (!this.client) {
            throw new Error("RPC client is not initialized");
        }
        const response: { project: Project } = await this.client.conn.sendRequest("project/create", params);
        return response.project;
    }

    async createComponent(params: CreateComponentReq): Promise<void> {
        if (!this.client) {
            throw new Error("RPC client is not initialized");
        }
        await this.client.conn.sendRequest("component/create", params);
    }

    async deleteComponent(params: DeleteCompReq): Promise<void> {
        if (!this.client) {
            throw new Error("RPC client is not initialized");
        }
        await this.client.conn.sendRequest("component/delete", params);
    }

    async getProjects(orgID: string): Promise<Project[]> {
        if (!this.client) {
            throw new Error("RPC client is not initialized");
        }
        const response: { projects: Project[] } = await this.client.conn.sendRequest("project/getProjects", { orgID });
        return response.projects;
    }

    async getComponentList(params: GetComponentsReq): Promise<ComponentKind[]> {
        if (!this.client) {
            throw new Error("RPC client is not initialized");
        }
        const response: { components: ComponentKind[] } = await this.client.conn.sendRequest("component/getList", params);
        return response.components;
    }

    async getBuildPacks(params: BuildPackReq) {
        if (!this.client) {
            throw new Error("RPC client is not initialized");
        }
        const response: { buildPacks: Buildpack[] } = await this.client.conn.sendRequest("component/getBuildPacks", params);
        return response.buildPacks;
    }


    async getRepoBranches(params: GetBranchesReq) {
        if (!this.client) {
            throw new Error("RPC client is not initialized");
        }
        const response: { branches: string[] } = await this.client.conn.sendRequest("repo/getBranches", params);
        return response.branches;
    }

    async isRepoAuthorized(params: IsRepoAuthorizedReq) {
        if (!this.client) {
            throw new Error("RPC client is not initialized");
        }
        const response: { isAccessible: boolean } = await this.client.conn.sendRequest("repo/isRepoAuthorized", params);
        return response.isAccessible;
    }

    async createComponentLink(params: CreateLinkReq): Promise<void> {
        if (!this.client) {
            throw new Error("RPC client is not initialized");
        }
        await this.client.conn.sendRequest("component/createLink", params);
    }

    async getUserInfo(): Promise<UserInfo> {
        if (!this.client) {
            throw new Error("RPC client is not initialized");
        }
        const response: { userInfo: UserInfo; isLoggedIn: boolean } = await this.client.conn.sendRequest("auth/getUserInfo");
        return response.userInfo;
    }

    async getSignInUrl(callbackUrl: string): Promise<string | void> {
        if (!this.client) {
            throw new Error("RPC client is not initialized");
        }
        const response: { loginUrl: string } = await this.client.conn.sendRequest("auth/getSignInUrl", { callbackUrl });
        return response.loginUrl;
    }

    async signInWithAuthCode(authCode: string, orgId?: string): Promise<UserInfo | void> {
        if (!this.client) {
            throw new Error("RPC client is not initialized");
        }
        const response: { userInfo: UserInfo } = await this.client.conn.sendRequest("auth/signInWithAuthCode", {
            authCode,
            orgId,
        });
        return response.userInfo;
    }

    async signOut(): Promise<string | void> {
        if (!this.client) {
            throw new Error("RPC client is not initialized");
        }
        await this.client.conn.sendRequest("auth/signOut");
    }
}

export class ChoreoTracer implements Tracer {
    log(dataObject: any): void {
        console.log(dataObject);
    }
}
