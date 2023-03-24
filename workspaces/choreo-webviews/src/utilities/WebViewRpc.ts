/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
import { Messenger } from "vscode-messenger-webview";
import { HOST_EXTENSION } from "vscode-messenger-common";

import {
    GetAllOrgsRequest,
    GetAllProjectsRequest,
    GetCurrentOrgRequest,
    GetLoginStatusRequest,
    ExecuteCommandRequest,
    GetComponents,
    LoginStatusChangedNotification,
    SelectedOrgChangedNotification,
    ChoreoLoginStatus,
    SelectedProjectChangedNotification,
    Organization,
    Project,
    CloseWebViewNotification,
    ShowErrorMessage,
    Component,
    GetProjectLocation,
    OpenExternal,
    OpenChoreoProject,
    CloneChoreoProject,
    setProjectRepository,
    getProjectRepository,
    isChoreoProject,
    getChoreoProject,
    PushLocalComponentsToChoreo,
    OpenArchitectureView,
    HasUnpushedComponents,
    UpdateProjectOverview,
    isSubpathAvailable,
    SubpathAvailableRequest,
    getDiagramComponentModel,
    GetComponentModelResponse
} from "@wso2-enterprise/choreo-core";

import { IChoreoProjectClient } from "@wso2-enterprise/choreo-client/lib/project/types";
import { ChoreoProjectClientRPCWebView } from "@wso2-enterprise/choreo-client/lib/project/rpc";
import { ChoreoGithubAppClientRPCWebView } from "@wso2-enterprise/choreo-client/lib/github/rpc/ghapp-client-rpc-webview";
import { ChoreoProjectManagerRPCWebview } from "@wso2-enterprise/choreo-client/lib/manager/rpc/manager-client-rpc-webview";

import type { WebviewApi } from "vscode-webview";
import { vscode } from "./vscode";
export class ChoreoWebViewAPI {

    private readonly _messenger;
    private static _instance: ChoreoWebViewAPI;
    private _projectClientRpc: ChoreoProjectClientRPCWebView;
    private _githubAppClient: ChoreoGithubAppClientRPCWebView;
    private _choreoProjectManager: ChoreoProjectManagerRPCWebview;

    constructor(vscodeAPI: WebviewApi<unknown>) {
        this._messenger = new Messenger(vscodeAPI);
        this._messenger.start();
        this._projectClientRpc = new ChoreoProjectClientRPCWebView(this._messenger);
        this._githubAppClient = new ChoreoGithubAppClientRPCWebView(this._messenger);
        this._choreoProjectManager = new ChoreoProjectManagerRPCWebview(this._messenger);
    }

    public async getLoginStatus(): Promise<ChoreoLoginStatus> {
        return this._messenger.sendRequest(GetLoginStatusRequest, HOST_EXTENSION, '');
    }

    public async getCurrentOrg(): Promise<Organization> {
        return this._messenger.sendRequest(GetCurrentOrgRequest, HOST_EXTENSION, '');
    }

    public async getAllOrgs(): Promise<Organization[]> {
        return this._messenger.sendRequest(GetAllOrgsRequest, HOST_EXTENSION, '');
    }

    public async getAllProjects(): Promise<Project[]> {
        return this._messenger.sendRequest(GetAllProjectsRequest, HOST_EXTENSION, '');
    }

    public async getComponents(projectId: string): Promise<Component[]> {
        return this._messenger.sendRequest(GetComponents, HOST_EXTENSION, projectId);
    }

    public async getProjectLocation(projectId: string): Promise<string | undefined> {
        return this._messenger.sendRequest(GetProjectLocation, HOST_EXTENSION, projectId);
    }

    public async openExternal(url: string): Promise<void> {
        this._messenger.sendRequest(OpenExternal, HOST_EXTENSION, url);
    }

    public async openChoreoProject(projectId: string): Promise<void> {
        return this._messenger.sendRequest(OpenChoreoProject, HOST_EXTENSION, projectId);
    }

    public async cloneChoreoProject(projectId: string): Promise<void> {
        return this._messenger.sendRequest(CloneChoreoProject, HOST_EXTENSION, projectId);
    }

    public async setProjectRepository(projId: string, repo: string): Promise<void> {
        return this._messenger.sendRequest(setProjectRepository, HOST_EXTENSION, { projId, repo });
    }

    public async getProjectRepository(projId: string): Promise<string> {
        return this._messenger.sendRequest(getProjectRepository, HOST_EXTENSION, projId);
    }

    public async isChoreoProject(): Promise<boolean> {
        return this._messenger.sendRequest(isChoreoProject, HOST_EXTENSION, undefined);
    }

    public async isSubpathAvailable(params: SubpathAvailableRequest): Promise<boolean> {
        return this._messenger.sendRequest(isSubpathAvailable, HOST_EXTENSION, params);
    }

    public async getChoreoProject(): Promise<Project | undefined> {
        return this._messenger.sendRequest(getChoreoProject, HOST_EXTENSION, undefined);
    }

    public async pushLocalComponentsToChoreo(projectId: string): Promise<void> {
        return this._messenger.sendRequest(PushLocalComponentsToChoreo, HOST_EXTENSION, projectId);
    }

    public async openArchitectureView(): Promise<void> {
        return this._messenger.sendRequest(OpenArchitectureView, HOST_EXTENSION, undefined);
    }

    public async getDiagramComponentModel(projId: string, orgHandler: string): Promise<GetComponentModelResponse> {
        return this._messenger.sendRequest(getDiagramComponentModel, HOST_EXTENSION, { projId, orgHandler } );
    }

    public onLoginStatusChanged(callback: (newStatus: ChoreoLoginStatus) => void) {
        this._messenger.onNotification(LoginStatusChangedNotification, callback);
    }

    public onSelectedOrgChanged(callback: (newOrg: Organization) => void) {
        this._messenger.onNotification(SelectedOrgChangedNotification, callback);
    }

    public onSelectedProjectChanged(callback: (projectId: string) => void) {
        this._messenger.onNotification(SelectedProjectChangedNotification, callback);
    }

    public triggerCmd(cmdId: string, ...args: any) {
        return this._messenger.sendRequest(ExecuteCommandRequest, HOST_EXTENSION, [cmdId, ...args]);
    }

    public getProjectClient(): IChoreoProjectClient {
        return this._projectClientRpc;
    }

    public showErrorMsg(error: string) {
        this._messenger.sendNotification(ShowErrorMessage, HOST_EXTENSION, error);
    }

    public getChoreoGithubAppClient(): ChoreoGithubAppClientRPCWebView {
        return this._githubAppClient;
    }

    public getChoreoProjectManager(): ChoreoProjectManagerRPCWebview {
        return this._choreoProjectManager;
    }

    public closeWebView() {
        this._messenger.sendNotification(CloseWebViewNotification, HOST_EXTENSION, undefined);
    }

    public static getInstance() {
        if (!this._instance) {
            this._instance = new ChoreoWebViewAPI(vscode);
        }
        return this._instance;
    }

    public async hasUnpushedComponents(projectId: string): Promise<boolean> {
        return this._messenger.sendRequest(HasUnpushedComponents, HOST_EXTENSION, projectId);
    }

    public updateProjectOverview(projectId: string) {
        return this._messenger.sendRequest(UpdateProjectOverview, HOST_EXTENSION, projectId);
    }
}
