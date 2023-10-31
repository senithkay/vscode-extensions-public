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
    isChoreoProject,
    getChoreoProject,
    PushLocalComponentsToChoreo,
    OpenArchitectureView,
    OpenCellView,
    UpdateProjectOverview,
    isSubpathAvailable,
    ReadEndpointsYaml,
    SubpathAvailableRequest,
    getDiagramComponentModel,
    DeleteComponent,
    PullComponent,
    PushedComponent,
    GetDeletedComponents,
    PushLocalComponentToChoreo,
    OpenDialogOptions,
    showOpenDialogRequest,
    getPreferredProjectRepository,
    setPreferredProjectRepository,
    RemoveDeletedComponents,
    GetComponentCount,
    ComponentCount,
    IsBareRepoRequestParams,
    IsBareRepoRequest,
    CheckProjectDeleted,
    HasChoreoSubscription,
    SendTelemetryEventParams,
    SendTelemetryEventNotification,
    SendTelemetryExceptionParams,
    SendTelemetryExceptionNotification,
    SendProjectTelemetryEventNotification,
    CreateNonBalLocalComponent,
    ChoreoComponentCreationParams,
    GetLocalComponentDirMetaData,
    getLocalComponentDirMetaDataRequest,
    getLocalComponentDirMetaDataRes,
    CreateNonBalLocalComponentFromExistingSource,
    getConsoleUrl,
    GitRepo,
    UserInfo,
    GetUserInfoRequest,
    GetComponentBuildStatus,
    BuildStatus,
    Deployment,
    GetComponentDevDeployment,
    OpenBillingPortal,
    Endpoint,
    RefreshComponentsNotification,
    FireRefreshComponentList,
    AskProjectDirPath,
    CloneChoreoProjectWithDir,
    PushLocalComponentsToChoreoParams,
    CheckProjectDeletedParams,
    CloneChoreoProjectParams,
    GetDeletedComponentsParams,
    GetComponentsRequestParams,
    SetExpandedComponents,
    GetExpandedComponents,
    GetChoreoWorkspaceMetadata,
    ChoreoWorkspaceMetaData,
    SetChoreoInstallOrg,
    ClearChoreoInstallOrg,
    SetWebviewCache,
    RestoreWebviewCache,
    ClearWebviewCache,
    GoToSource,
    IsBallerinaExtInstalled,
    RefreshWorkspaceNotification,
    Buildpack,
    GetBuildPackParams,
    GetBuildpack,
} from "@wso2-enterprise/choreo-core";
import { GetComponentModelResponse } from "@wso2-enterprise/ballerina-languageclient";
import { IChoreoProjectClient } from "@wso2-enterprise/choreo-client/lib/project/types";
import { ChoreoProjectClientRPCWebView } from "@wso2-enterprise/choreo-client/lib/project/rpc";
import { ChoreoGithubAppClientRPCWebView } from "@wso2-enterprise/choreo-client/lib/github/rpc/ghapp-client-rpc-webview";
import { ChoreoProjectManagerRPCWebview } from "@wso2-enterprise/choreo-client/lib/manager/rpc/manager-client-rpc-webview";
import { ChoreoCellViewRPCWebview } from "@wso2-enterprise/choreo-client/lib/cellView/rpc/cell-view-client-rpc-webview";
import type { WebviewApi } from "vscode-webview";
import { vscode } from "./vscode";
export class ChoreoWebViewAPI {

    private readonly _messenger;
    private static _instance: ChoreoWebViewAPI;
    private _projectClientRpc: ChoreoProjectClientRPCWebView;
    private _githubAppClient: ChoreoGithubAppClientRPCWebView;
    private _choreoProjectManager: ChoreoProjectManagerRPCWebview;
    private _choreoCellView: ChoreoCellViewRPCWebview;

    constructor(vscodeAPI: WebviewApi<unknown>) {
        this._messenger = new Messenger(vscodeAPI);
        this._messenger.start();
        this._projectClientRpc = new ChoreoProjectClientRPCWebView(this._messenger);
        this._githubAppClient = new ChoreoGithubAppClientRPCWebView(this._messenger);
        this._choreoProjectManager = new ChoreoProjectManagerRPCWebview(this._messenger);
        this._choreoCellView = new ChoreoCellViewRPCWebview(this._messenger);
    }

    public async getLoginStatus(): Promise<ChoreoLoginStatus> {
        return this._messenger.sendRequest(GetLoginStatusRequest, HOST_EXTENSION, '');
    }

    public async getCurrentOrg(): Promise<Organization> {
        return this._messenger.sendRequest(GetCurrentOrgRequest, HOST_EXTENSION, '');
    }

    public async getUserInfo(): Promise<UserInfo> {
        return this._messenger.sendRequest(GetUserInfoRequest, HOST_EXTENSION, undefined);
    }

    public async getAllProjects(orgId: number): Promise<Project[]> {
        return this._messenger.sendRequest(GetAllProjectsRequest, HOST_EXTENSION, orgId);
    }

    public async getComponents(params: GetComponentsRequestParams): Promise<Component[]> {
        return this._messenger.sendRequest(GetComponents, HOST_EXTENSION, params);
    }
    
    public async getDeletedComponents(params: GetDeletedComponentsParams): Promise<PushedComponent[]> {
        return this._messenger.sendRequest(GetDeletedComponents, HOST_EXTENSION, params);
    }

    public async removeDeletedComponents(params: {projectId: string; components: PushedComponent[]}): Promise<void> {
        this._messenger.sendRequest(RemoveDeletedComponents, HOST_EXTENSION, params);
    }

    public async getComponentDevDeployment(component: Component): Promise<Deployment> {
        return this._messenger.sendRequest(GetComponentDevDeployment, HOST_EXTENSION, component);
    }

    public async getComponentBuildStatus(component: Component): Promise<BuildStatus> {
        return this._messenger.sendRequest(GetComponentBuildStatus, HOST_EXTENSION, component);
    }

    public async deleteComponent(params: {component: Component; projectId: string}): Promise<Component | null> {
        return this._messenger.sendRequest(DeleteComponent, HOST_EXTENSION, params);
    }

    public async pullComponent(params: {componentId: string; projectId: string}): Promise<void> {
        return this._messenger.sendRequest(PullComponent, HOST_EXTENSION, params);
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

    public async cloneChoreoProject(params: CloneChoreoProjectParams): Promise<void> {
        return this._messenger.sendRequest(CloneChoreoProject, HOST_EXTENSION, params);
    }

    public async cloneChoreoProjectWithDir(project: Project, dirPath: string, askOpeningOptions?: boolean): Promise<void> {
        return this._messenger.sendRequest(CloneChoreoProjectWithDir, HOST_EXTENSION, { project, dirPath, askOpeningOptions });
    }

    public async askProjectDirPath(): Promise<string | undefined> {
        return this._messenger.sendRequest(AskProjectDirPath, HOST_EXTENSION, undefined);
    }

    public async isBareRepo(params: IsBareRepoRequestParams): Promise<boolean> {
        return this._messenger.sendRequest(IsBareRepoRequest, HOST_EXTENSION, params);
    }

    public async setExpandedComponents(projId: string, componentNames: string[]): Promise<void> {
        return this._messenger.sendRequest(SetExpandedComponents, HOST_EXTENSION, { projId, componentNames });
    }

    public async getExpandedComponents(projId: string): Promise<string[]> {
        return this._messenger.sendRequest(GetExpandedComponents, HOST_EXTENSION, projId);
    }

    public async setPreferredProjectRepository(projId: string, repo: GitRepo): Promise<void> {
        return this._messenger.sendRequest(setPreferredProjectRepository, HOST_EXTENSION, { projId, repo });
    }

    public async getPreferredProjectRepository(projId: string): Promise<GitRepo> {
        return this._messenger.sendRequest(getPreferredProjectRepository, HOST_EXTENSION, projId);
    }

    public async isChoreoProject(): Promise<boolean> {
        return this._messenger.sendRequest(isChoreoProject, HOST_EXTENSION, undefined);
    }

    public async getChoreoWorkspaceMetadata(): Promise<ChoreoWorkspaceMetaData> {
        return this._messenger.sendRequest(GetChoreoWorkspaceMetadata, HOST_EXTENSION, undefined);
    }

    public async getConsoleUrl(): Promise<string> {
        return this._messenger.sendRequest(getConsoleUrl, HOST_EXTENSION, undefined);
    }

    public async isSubpathAvailable(params: SubpathAvailableRequest): Promise<boolean> {
        return this._messenger.sendRequest(isSubpathAvailable, HOST_EXTENSION, params);
    }

    public async readEndpointsYaml(params: SubpathAvailableRequest): Promise<Endpoint | undefined> {
        return this._messenger.sendRequest(ReadEndpointsYaml, HOST_EXTENSION, params);
    }

    public async openBillingPortal(orgId: string): Promise<void> {
        return this._messenger.sendRequest(OpenBillingPortal, HOST_EXTENSION, orgId);
    }

    public async getLocalComponentDirMetaData(params: getLocalComponentDirMetaDataRequest): Promise<getLocalComponentDirMetaDataRes> {
        return this._messenger.sendRequest(GetLocalComponentDirMetaData, HOST_EXTENSION, params);
    }

    public async checkProjectDeleted(params: CheckProjectDeletedParams): Promise<boolean> {
        return this._messenger.sendRequest(CheckProjectDeleted, HOST_EXTENSION, params);
    }

    public async createNonBalComponent(params: ChoreoComponentCreationParams): Promise<void> {
        return this._messenger.sendRequest(CreateNonBalLocalComponent, HOST_EXTENSION, params);
    }

    public async createNonBalLocalComponentFromExistingSource(params: ChoreoComponentCreationParams): Promise<void> {
        return this._messenger.sendRequest(CreateNonBalLocalComponentFromExistingSource, HOST_EXTENSION, params);
    }

    public async getBuildpack(params: GetBuildPackParams): Promise<Buildpack[]> {
        return this._messenger.sendRequest(GetBuildpack, HOST_EXTENSION, params);
    }

    public async getChoreoProject(): Promise<Project | undefined> {
        return this._messenger.sendRequest(getChoreoProject, HOST_EXTENSION, undefined);
    }

    public async pushLocalComponentsToChoreo(params: PushLocalComponentsToChoreoParams): Promise<string[]> {
        return this._messenger.sendRequest(PushLocalComponentsToChoreo, HOST_EXTENSION, params);
    }

    public async pushLocalComponentToChoreo(params: {projectId: string, componentName: string}): Promise<void> {
        return this._messenger.sendRequest(PushLocalComponentToChoreo, HOST_EXTENSION, params);
    }

    public async goToSource(filePath: string): Promise<void> {
        return this._messenger.sendRequest(GoToSource, HOST_EXTENSION, filePath);
    }

    public async openArchitectureView(): Promise<void> {
        return this._messenger.sendRequest(OpenArchitectureView, HOST_EXTENSION, undefined);
    }

    public async openCellView(): Promise<void> {
        return this._messenger.sendRequest(OpenCellView, HOST_EXTENSION, undefined);
    }

    public async getDiagramComponentModel(projId: string, orgId: number): Promise<GetComponentModelResponse> {
        return this._messenger.sendRequest(getDiagramComponentModel, HOST_EXTENSION, { projId, orgId } );
    }

    public onLoginStatusChanged(callback: (newStatus: ChoreoLoginStatus) => void) {
        this._messenger.onNotification(LoginStatusChangedNotification, callback);
    }

    public onRefreshComponents(callback: () => void) {
        this._messenger.onNotification(RefreshComponentsNotification, callback);
    }

    public onRefreshWorkspaceMetadata(callback: () => void) {
        this._messenger.onNotification(RefreshWorkspaceNotification, callback);
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

    public getChoreoCellView(): ChoreoCellViewRPCWebview {
        return this._choreoCellView;
    }

    public closeWebView() {
        this._messenger.sendNotification(CloseWebViewNotification, HOST_EXTENSION, undefined);
    }

    public async showOpenDialog(options: OpenDialogOptions): Promise<string[] | undefined> {
        return this._messenger.sendRequest(showOpenDialogRequest, HOST_EXTENSION, options);
    }

    public static getInstance() {
        if (!this._instance) {
            this._instance = new ChoreoWebViewAPI(vscode);
        }
        return this._instance;
    }

    public setChoreoInstallOrg(orgId: number) {
        return this._messenger.sendRequest(SetChoreoInstallOrg, HOST_EXTENSION, orgId);
    }

    public clearChoreoInstallOrg() {
        return this._messenger.sendRequest(ClearChoreoInstallOrg, HOST_EXTENSION, undefined);
    }

    public updateProjectOverview(projectId: string) {
        return this._messenger.sendRequest(UpdateProjectOverview, HOST_EXTENSION, projectId);
    }

    public async getComponentCount(): Promise<ComponentCount> {
        return this._messenger.sendRequest(GetComponentCount, HOST_EXTENSION, undefined);
    }

    public async hasChoreoSubscription(): Promise<boolean> {
        return this._messenger.sendRequest(HasChoreoSubscription, HOST_EXTENSION, undefined);
    }
    
    public sendProjectTelemetryEvent(params: SendTelemetryEventParams) {
        return this._messenger.sendNotification(SendProjectTelemetryEventNotification, HOST_EXTENSION, params);
    }

    public sendTelemetryEvent(params: SendTelemetryEventParams) {
        return this._messenger.sendNotification(SendTelemetryEventNotification, HOST_EXTENSION, params);
    }

    public sendTelemetryException(params: SendTelemetryExceptionParams) {
        return this._messenger.sendNotification(SendTelemetryExceptionNotification, HOST_EXTENSION, params);
    }

    public async fireRefreshComponents(): Promise<void> {
        return this._messenger.sendRequest(FireRefreshComponentList, HOST_EXTENSION, null);
    }

    public async setWebviewCache(cacheKey: IDBValidKey, data: unknown): Promise<void> {
        return this._messenger.sendRequest(SetWebviewCache, HOST_EXTENSION, { cacheKey, data });
    }

    public async restoreWebviewCache(cacheKey: IDBValidKey): Promise<unknown> {
        return this._messenger.sendRequest(RestoreWebviewCache, HOST_EXTENSION, cacheKey);
    }

    public async clearWebviewCache(cacheKey: IDBValidKey): Promise<unknown> {
        return this._messenger.sendRequest(ClearWebviewCache, HOST_EXTENSION, cacheKey);
    }
    
    public async isBallerinaExtInstalled(): Promise<boolean> {
        return this._messenger.sendRequest(IsBallerinaExtInstalled, HOST_EXTENSION, undefined);
    }
}
