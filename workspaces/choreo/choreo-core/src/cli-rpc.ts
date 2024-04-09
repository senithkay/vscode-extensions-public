import { Buildpack, ComponentKind, Project } from "./types";
import { HOST_EXTENSION, RequestType } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";

export interface BuildPackReq { orgId: string; orgUuid: string; componentType: string }
export interface GetBranchesReq { orgId: string; repoUrl: string }
export interface IsRepoAuthorizedReq { orgId: string; repoUrl: string }
export interface GetComponentsReq {orgId: string; projectHandle: string}
export interface CreateLinkReq {componentDir: string;  orgHandle: string; projectHandle: string;  componentHandle: string;}
export interface CreateProjectReq { orgId: string; orgHandler: string; projectName: string; region: string;}
export interface DeleteCompReq { orgId: string; orgHandler: string; projectId: string; compHandler: string;}
export interface CreateComponentReq { 
    orgId: string; 
    projectHandle: string; 
    name: string; 
    type: string;
    buildPackLang: string;
    componentDir: string;
    repoUrl: string;
    branch: string;
    langVersion: string;
    dockerFile: string;
    port: number;
    spaBuildCommand: string;
    spaNodeVersion: string;
    spaOutputDir: string;
}

export interface IChoreoRPCClient {
    getProjects(orgID: string): Promise<Project[]>;
    getComponentList(params: GetComponentsReq): Promise<ComponentKind[]>;
    createComponentLink(params: CreateLinkReq): Promise<void>;
    createProject(params: CreateProjectReq): Promise<Project>;
    createComponent(params: CreateComponentReq): Promise<void>;
    getBuildPacks(params: BuildPackReq): Promise<Buildpack[]>;
    getRepoBranches(params: GetBranchesReq): Promise<string[]>;
    isRepoAuthorized(params: IsRepoAuthorizedReq): Promise<boolean>;
    deleteComponent(params: DeleteCompReq): Promise<void>;
}

export class ChoreoRpcWebview implements IChoreoRPCClient {
    constructor (private _messenger: Messenger) {
    }

    getProjects(orgID: string): Promise<Project[]> {
        return this._messenger.sendRequest(ChoreoRpcGetProjectsRequest, HOST_EXTENSION, orgID);
    }
    getComponentList(params: GetComponentsReq): Promise<ComponentKind[]> {
        return this._messenger.sendRequest(ChoreoRpcGetComponentsRequest, HOST_EXTENSION, params);
    }
    createComponentLink(params: CreateLinkReq): Promise<void> {
        return this._messenger.sendRequest(ChoreoRpcCreateLinkRequest, HOST_EXTENSION, params);
    }
    createProject(params: CreateProjectReq): Promise<Project> {
        return this._messenger.sendRequest(ChoreoRpcCreateProjectRequest, HOST_EXTENSION, params);
    }
    createComponent(params: CreateComponentReq): Promise<void> {
        return this._messenger.sendRequest(ChoreoRpcCreateComponentRequest, HOST_EXTENSION, params);
    }
    getBuildPacks(params:BuildPackReq): Promise<Buildpack[]> {
        return this._messenger.sendRequest(ChoreoRpcGetBuildPacksRequest, HOST_EXTENSION, params);
    }
    getRepoBranches(params:GetBranchesReq): Promise<string[]> {
        return this._messenger.sendRequest(ChoreoRpcGetBranchesRequest, HOST_EXTENSION, params);
    }
    isRepoAuthorized(params:IsRepoAuthorizedReq): Promise<boolean> {
        return this._messenger.sendRequest(ChoreoRpcIsRepoAuthorizedRequest, HOST_EXTENSION, params);
    }
    deleteComponent(params:DeleteCompReq): Promise<void> {
        return this._messenger.sendRequest(ChoreoRpcDeleteComponentRequest, HOST_EXTENSION, params);
    }
}

export const ChoreoRpcGetProjectsRequest: RequestType<string, Project[]> = { method: 'rpc/project/getProjects' };
export const ChoreoRpcGetComponentsRequest: RequestType<GetComponentsReq, ComponentKind[]> = { method: 'rpc/component/getList' };
export const ChoreoRpcCreateLinkRequest: RequestType<CreateLinkReq, void> = { method: 'rpc/component/createLink' };
export const ChoreoRpcCreateProjectRequest: RequestType<CreateProjectReq, Project> = { method: 'rpc/project/create' };
export const ChoreoRpcCreateComponentRequest: RequestType<CreateComponentReq, void> = { method: 'rpc/component/create' };
export const ChoreoRpcGetBuildPacksRequest: RequestType<BuildPackReq, Buildpack[]> = { method: 'rpc/component/getBuildPacks' };
export const ChoreoRpcGetBranchesRequest: RequestType<GetBranchesReq, string[]> = { method: 'rpc/repo/getBranches' };
export const ChoreoRpcIsRepoAuthorizedRequest: RequestType<IsRepoAuthorizedReq, boolean> = { method: 'rpc/repo/isRepoAuthorized' };
export const ChoreoRpcDeleteComponentRequest: RequestType<DeleteCompReq, void> = { method: 'rpc/component/delete' };

