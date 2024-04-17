import { getLogger } from "../logger/logger";
import { MessageConnection, Trace, Tracer } from "vscode-jsonrpc";
import { StdioConnection } from "./connection";
import { Buildpack, ComponentKind, Project, UserInfo, IChoreoRPCClient, BuildPackReq, GetBranchesReq, IsRepoAuthorizedReq, GetComponentsReq, CreateLinkReq, CreateProjectReq, CreateComponentReq, DeleteCompReq } from "@wso2-enterprise/choreo-core";
import { workspace } from "vscode";
import { handlerError } from "../error-utils";

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

    async sendRequest<T>(method: string, params?: any): Promise<T> {
        this._conn?.sendRequest
        if (!this._conn) {
            throw new Error("Connection is not initialized");
        }
        try {
            return await this._conn.sendRequest<T>(method, params);
        } catch (e) {
            getLogger().error("Error sending request", e);
            handlerError(e);
            throw e;
        }
    }
}

export class ChoreoRPCClient implements IChoreoRPCClient {
    private client: RPCClient | undefined;

    public constructor() {
        this.init()
    }

    async init() {
        try {
            this.client = await RPCClient.getInstance();
        } catch (e) {
            getLogger().error("Error initializing RPC client", e);
        }
    }


    async createProject(params: CreateProjectReq): Promise<Project> {
        if (!this.client) {
            throw new Error("RPC client is not initialized");
        }
        const resp = await this.client.sendRequest<{ project: Project }>("project/create", params);
        return resp.project;
    }

    async createComponent(params: CreateComponentReq): Promise<void> {
        if (!this.client) {
            throw new Error("RPC client is not initialized");
        }
        await this.client.sendRequest("component/create", params);
    }

    async createEpYaml(params: CreateComponentReq): Promise<{ success: boolean }> {
        if (!this.client) {
            throw new Error("RPC client is not initialized");
        }
        console.log("Creating ep yaml", params);
        const resp = await this.client.sendRequest<{ success: boolean }>("component/createEpYaml", params);
        return resp;
    }

    async deleteComponent(params: DeleteCompReq): Promise<void> {
        if (!this.client) {
            throw new Error("RPC client is not initialized");
        }
        await this.client.sendRequest("component/delete", params);
    }

    async getProjects(orgID: string): Promise<Project[]> {
        if (!this.client) {
            throw new Error("RPC client is not initialized");
        }
        const response = await this.client.sendRequest<{ projects: Project[] }>("project/getProjects", { orgID });
        return response.projects;
    }

    async getComponentList(params: GetComponentsReq): Promise<ComponentKind[]> {
        if (!this.client) {
            throw new Error("RPC client is not initialized");
        }
        const response = await this.client.sendRequest<{ components: ComponentKind[] }>("component/getList", params);
        return response.components;
    }

    async getBuildPacks(params: BuildPackReq) {
        if (!this.client) {
            throw new Error("RPC client is not initialized");
        }
        const response = await this.client.sendRequest<{ buildPacks: Buildpack[] }>("component/getBuildPacks", params);
        return response.buildPacks;
    }


    async getRepoBranches(params: GetBranchesReq) {
        if (!this.client) {
            throw new Error("RPC client is not initialized");
        }
        const response = await this.client.sendRequest<{ branches: string[] }>("repo/getBranches", params);
        return response.branches;
    }

    async isRepoAuthorized(params: IsRepoAuthorizedReq) {
        if (!this.client) {
            throw new Error("RPC client is not initialized");
        }
        const response = await this.client.sendRequest<{ isAccessible: boolean }>("repo/isRepoAuthorized", params);
        return response.isAccessible;
    }

    async createComponentLink(params: CreateLinkReq): Promise<void> {
        if (!this.client) {
            throw new Error("RPC client is not initialized");
        }
        await this.client.sendRequest("component/createLink", params);
    }

    async getUserInfo(): Promise<UserInfo> {
        if (!this.client) {
            throw new Error("RPC client is not initialized");
        }
        const response = await this.client.sendRequest<{ userInfo: UserInfo; isLoggedIn: boolean }>("auth/getUserInfo");
        return response.userInfo;
    }

    async getSignInUrl(callbackUrl: string): Promise<string | void> {
        if (!this.client) {
            throw new Error("RPC client is not initialized");
        }
        const response = await this.client.sendRequest<{ loginUrl: string }>("auth/getSignInUrl", { callbackUrl });
        return response.loginUrl;
    }

    async signInWithAuthCode(authCode: string, orgId?: string): Promise<UserInfo | void> {
        if (!this.client) {
            throw new Error("RPC client is not initialized");
        }
        const response = await this.client.sendRequest<{ userInfo: UserInfo }>("auth/signInWithAuthCode", {
            authCode,
            orgId,
        });
        return response.userInfo;
    }

    async signOut(): Promise<string | void> {
        if (!this.client) {
            throw new Error("RPC client is not initialized");
        }
        await this.client.sendRequest("auth/signOut");
    }
}

export class ChoreoTracer implements Tracer {
    log(dataObject: any): void {
        console.log(dataObject);
    }
}
