import type {
	BuildKind,
	BuildPackReq,
	Buildpack,
	CommitHistory,
	ComponentDeployment,
	ComponentEP,
	ComponentKind,
	CreateBuildReq,
	CreateComponentReq,
	CreateDeploymentReq,
	CreateProjectReq,
	DeleteCompReq,
	DeploymentTrack,
	Environment,
	GetBranchesReq,
	GetBuildsReq,
	GetCommitsReq,
	GetComponentEndpointsReq,
	GetComponentItemReq,
	GetComponentsReq,
	GetDeploymentStatusReq,
	GetDeploymentTracksReq,
	GetProjectEnvsReq,
	GetSwaggerSpecReq,
	GetTestKeyReq,
	GetTestKeyResp,
	IChoreoRPCClient,
	IsRepoAuthorizedReq,
	IsRepoAuthorizedResp,
	Project,
	UserInfo,
	ViewBuildLogsReq,
} from "@wso2-enterprise/choreo-core";
import { type MessageConnection, Trace, type Tracer } from "vscode-jsonrpc";
import { handlerError } from "../error-utils";
import { getLogger } from "../logger/logger";
import { StdioConnection } from "./connection";

export class RPCClient {
	private _conn: MessageConnection | undefined;
	private static _instance: RPCClient;

	private constructor() {}

	async init() {
		getLogger().debug("Activating choreo rpc server");
		const stdioConnection = new StdioConnection();
		this._conn = stdioConnection.getProtocolConnection();
		this._conn.trace(Trace.Verbose, new ChoreoTracer());
		this._conn.listen();

		try {
			// biome-ignore lint/complexity/noBannedTypes:
			const resp = await this._conn.sendRequest<{}>("initialize", {
				clientName: "vscode",
				clientVersion: "1.0.0",
			});
			console.log("Initialized RPC server", resp);
		} catch (e) {
			getLogger().error("failed to initialize rpc client", e);
		}
	}

	static async getInstance(): Promise<RPCClient> {
		if (RPCClient._instance) {
			return RPCClient._instance;
		}

		RPCClient._instance = new RPCClient();
		await RPCClient._instance.init();
		return RPCClient._instance;
	}

	async sendRequest<T>(method: string, params?: any, isRetry?: boolean): Promise<T> {
		if (!this._conn) {
			throw new Error("Connection is not initialized");
		}
		try {
			return await this._conn.sendRequest<T>(method, params);
		} catch (e: any) {
			// TODO: have a better way to check if connection is closed
			if (e.message?.includes("Connection is closed") && !isRetry) {
				await this.init();
				return this.sendRequest(method, params, true);
			}
			getLogger().error("Error sending request", e);
			handlerError(e);
			throw e;
		}
	}
}

export class ChoreoRPCClient implements IChoreoRPCClient {
	private client: RPCClient | undefined;

	public constructor() {
		this.init();
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

	async createComponent(params: CreateComponentReq): Promise<ComponentKind> {
		if (!this.client) {
			throw new Error("RPC client is not initialized");
		}
		const resp = await this.client.sendRequest<{ component: ComponentKind }>("component/create", params);
		return resp.component;
	}

	async createEpYaml(params: CreateComponentReq): Promise<{ success: boolean }> {
		if (!this.client) {
			throw new Error("RPC client is not initialized");
		}
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

	async getComponentItem(params: GetComponentItemReq): Promise<ComponentKind> {
		if (!this.client) {
			throw new Error("RPC client is not initialized");
		}
		const response = await this.client.sendRequest<{ component: ComponentKind }>("component/getItem", params);
		return response.component;
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
		const response = await this.client.sendRequest<IsRepoAuthorizedResp>("repo/isRepoAuthorized", params);
		return response;
	}

	async getUserInfo(): Promise<UserInfo> {
		if (!this.client) {
			throw new Error("RPC client is not initialized");
		}
		const response = await this.client.sendRequest<{ userInfo: UserInfo; isLoggedIn: boolean }>("auth/getUserInfo");
		return response.userInfo;
	}

	async getSignInUrl(callbackUrl: string): Promise<string | undefined> {
		if (!this.client) {
			throw new Error("RPC client is not initialized");
		}
		const response = await this.client.sendRequest<{ loginUrl: string }>("auth/getSignInUrl", { callbackUrl });
		return response.loginUrl;
	}

	async signInWithAuthCode(authCode: string, orgId?: string): Promise<UserInfo | undefined> {
		if (!this.client) {
			throw new Error("RPC client is not initialized");
		}
		const response = await this.client.sendRequest<{ userInfo: UserInfo }>("auth/signInWithAuthCode", {
			authCode,
			orgId,
		});
		return response.userInfo;
	}

	async signOut(): Promise<string | undefined> {
		if (!this.client) {
			throw new Error("RPC client is not initialized");
		}
		await this.client.sendRequest("auth/signOut");
	}

	async createBuild(params: CreateBuildReq): Promise<BuildKind> {
		if (!this.client) {
			throw new Error("RPC client is not initialized");
		}
		const response: { build: BuildKind } = await this.client.sendRequest("build/create", params);
		return response.build;
	}

	async getDeploymentTracks(params: GetDeploymentTracksReq): Promise<DeploymentTrack[]> {
		if (!this.client) {
			throw new Error("RPC client is not initialized");
		}
		const response: { deploymentTracks: DeploymentTrack[] } = await this.client.sendRequest("component/getDeploymentTracks", params);
		return response.deploymentTracks;
	}

	async getBuilds(params: GetBuildsReq): Promise<BuildKind[]> {
		if (!this.client) {
			throw new Error("RPC client is not initialized");
		}
		const response: { builds: BuildKind[] } = await this.client.sendRequest("build/getList", params);
		return response.builds;
	}

	async getCommits(params: GetCommitsReq): Promise<CommitHistory[]> {
		if (!this.client) {
			throw new Error("RPC client is not initialized");
		}
		const response: { commits: CommitHistory[] } = await this.client.sendRequest("component/getCommits", params);
		return response.commits;
	}

	async getEnvs(params: GetProjectEnvsReq): Promise<Environment[]> {
		if (!this.client) {
			throw new Error("RPC client is not initialized");
		}
		const response: { envs: Environment[] } = await this.client.sendRequest("project/getEnvs", params);
		return response.envs;
	}

	async getComponentEndpoints(params: GetComponentEndpointsReq): Promise<ComponentEP[]> {
		if (!this.client) {
			throw new Error("RPC client is not initialized");
		}
		const response: { endpoints: ComponentEP[] } = await this.client.sendRequest("component/getEndpoints", params);
		return response.endpoints;
	}

	async getDeploymentStatus(params: GetDeploymentStatusReq): Promise<ComponentDeployment | null> {
		if (!this.client) {
			throw new Error("RPC client is not initialized");
		}
		const response: { deployment: ComponentDeployment | undefined } | undefined = await this.client.sendRequest(
			"component/getDeploymentStatus",
			params,
		);
		return response?.deployment ?? null;
	}

	async createDeployment(params: CreateDeploymentReq): Promise<void> {
		if (!this.client) {
			throw new Error("RPC client is not initialized");
		}
		await this.client.sendRequest("deployment/create", params);
	}

	async getBuildLogs(params: ViewBuildLogsReq): Promise<string> {
		if (!this.client) {
			throw new Error("RPC client is not initialized");
		}
		const response: { logs: string } = await this.client.sendRequest("build/logs", params);
		return response.logs;
	}

	async obtainGithubToken(params: { code: string; orgId: string }): Promise<void> {
		if (!this.client) {
			throw new Error("RPC client is not initialized");
		}
		await this.client.sendRequest("repo/obtainGithubToken", params);
	}

	async getTestKey(params: GetTestKeyReq): Promise<GetTestKeyResp> {
		if (!this.client) {
			throw new Error("RPC client is not initialized");
		}
		const response: GetTestKeyResp = await this.client.sendRequest("apim/getTestKey", params);
		return response;
	}

	async getSwaggerSpec(params: GetSwaggerSpecReq): Promise<object> {
		if (!this.client) {
			throw new Error("RPC client is not initialized");
		}
		const response: { swagger: object } = await this.client.sendRequest("apim/getSwaggerSpec", params);
		return response.swagger;
	}
}

export class ChoreoTracer implements Tracer {
	log(dataObject: any): void {
		console.log(dataObject);
	}
}
