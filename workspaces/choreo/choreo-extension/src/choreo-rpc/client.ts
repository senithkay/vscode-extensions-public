import { getLogger } from "../logger/logger";
import { MessageConnection, Trace, Tracer } from "vscode-jsonrpc";
import { StdioConnection } from "./connection";
import { Buildpack, ComponentKind, Project, UserInfo, IChoreoRPCClient, BuildPackReq, GetBranchesReq, IsRepoAuthorizedReq, GetComponentsReq, CreateLinkReq, CreateProjectReq, CreateComponentReq, DeleteCompReq, CreateBuildReq, BuildKind, GetDeploymentTracksReq, DeploymentTrack, GetBuildsReq, GetCommitsReq, CommitHistory } from "@wso2-enterprise/choreo-core";
import { workspace } from "vscode";


export class ChoreoRPCClient implements IChoreoRPCClient{
    private _conn: MessageConnection;
    private static _instance: ChoreoRPCClient;

    public constructor() {
        getLogger().debug("Activating choreo rpc server");
        const executablePath = workspace.getConfiguration().get<string>("cli.path");
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

    async createProject(params: CreateProjectReq): Promise<Project> {
        const client = await ChoreoRPCClient.getInstance();
        const response: {project: Project} = await client.conn.sendRequest("project/create", params);
        return response.project;
    }

    async createComponent(params: CreateComponentReq): Promise<void> {
        const client = await ChoreoRPCClient.getInstance();
        await client.conn.sendRequest("component/create", params);
    }

    async deleteComponent(params: DeleteCompReq): Promise<void> {
        const client = await ChoreoRPCClient.getInstance();
        await client.conn.sendRequest("component/delete", params);
    }

    async getProjects(orgID: string): Promise<Project[]> {
        const client = await ChoreoRPCClient.getInstance();
        const response: { projects: Project[] } = await client.conn.sendRequest("project/getProjects", { orgID });
        return response.projects;
    }
    
    async getComponentList(params: GetComponentsReq): Promise<ComponentKind[]> {
        const client = await ChoreoRPCClient.getInstance();
        const response: { components: ComponentKind[] } = await client.conn.sendRequest("component/getList", params);
        return response.components;
    }

    async getBuildPacks(params: BuildPackReq) {
        const client = await ChoreoRPCClient.getInstance();
        const response: { buildPacks: Buildpack[] } = await client.conn.sendRequest("component/getBuildPacks", params);
        return response.buildPacks;
    }


    async getRepoBranches(params: GetBranchesReq) {
        const client = await ChoreoRPCClient.getInstance();
        const response: { branches: string[] } = await client.conn.sendRequest("repo/getBranches", params);
        return response.branches;
    }

    async isRepoAuthorized(params: IsRepoAuthorizedReq) {
        const client = await ChoreoRPCClient.getInstance();
        const response: { isAccessible: boolean } = await client.conn.sendRequest("repo/isRepoAuthorized", params);
        return response.isAccessible;
    }

    async createComponentLink(params: CreateLinkReq): Promise<void> {
        const client = await ChoreoRPCClient.getInstance();
        await client.conn.sendRequest("component/createLink", params);
    }

    async getUserInfo(): Promise<UserInfo> {
        const client = await ChoreoRPCClient.getInstance();
        const response: { userInfo: UserInfo; isLoggedIn: boolean } = await client.conn.sendRequest("auth/getUserInfo");
        return response.userInfo;
    }

    async getSignInUrl(callbackUrl: string): Promise<string | void> {
        const client = await ChoreoRPCClient.getInstance();
        const response: { loginUrl: string } = await client.conn.sendRequest("auth/getSignInUrl", { callbackUrl });
        return response.loginUrl;
    }

    async signInWithAuthCode(authCode: string, orgId?: string): Promise<UserInfo | void> {
        const client = await ChoreoRPCClient.getInstance();
        const response: { userInfo: UserInfo } = await client.conn.sendRequest("auth/signInWithAuthCode", {
            authCode,
            orgId,
        });
        return response.userInfo;
    }

    async signOut(): Promise<string | void> {
        const client = await ChoreoRPCClient.getInstance();
        await client.conn.sendRequest("auth/signOut");
    }

    async createBuild(params: CreateBuildReq): Promise<BuildKind> {
        const client = await ChoreoRPCClient.getInstance();
        const response: {build: BuildKind} = await client.conn.sendRequest("build/create", params);
        return response.build;
    }

    async getDeploymentTracks(params: GetDeploymentTracksReq): Promise<DeploymentTrack[]> {
        const client = await ChoreoRPCClient.getInstance();
        const response: { deploymentTracks: DeploymentTrack[] } = await client.conn.sendRequest("component/getDeploymentTracks", params);
        return response.deploymentTracks;
    }

    async getBuilds(params: GetBuildsReq): Promise<BuildKind[]> {
        const client = await ChoreoRPCClient.getInstance();
        const response: { builds: BuildKind[] } = await client.conn.sendRequest("build/getList", params);
        return response.builds;
    }

    async getCommits(params: GetCommitsReq): Promise<CommitHistory[]> {
        const client = await ChoreoRPCClient.getInstance();
        const response: { commits: CommitHistory[] } = await client.conn.sendRequest("component/getCommits", params);
        return response.commits;
    }
}

export class ChoreoTracer implements Tracer {
    log(dataObject: any): void {
        console.log(dataObject);
    }
}
