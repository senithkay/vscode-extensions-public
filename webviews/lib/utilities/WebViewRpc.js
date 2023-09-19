var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
import { GetAllProjectsRequest, GetCurrentOrgRequest, GetLoginStatusRequest, ExecuteCommandRequest, GetComponents, LoginStatusChangedNotification, SelectedOrgChangedNotification, SelectedProjectChangedNotification, CloseWebViewNotification, ShowErrorMessage, GetProjectLocation, OpenExternal, OpenChoreoProject, CloneChoreoProject, isChoreoProject, getChoreoProject, PushLocalComponentsToChoreo, OpenArchitectureView, OpenCellView, UpdateProjectOverview, isSubpathAvailable, ReadEndpointsYaml, getDiagramComponentModel, DeleteComponent, PullComponent, GetDeletedComponents, PushLocalComponentToChoreo, showOpenDialogRequest, getPreferredProjectRepository, setPreferredProjectRepository, RemoveDeletedComponents, GetComponentCount, IsBareRepoRequest, CheckProjectDeleted, HasChoreoSubscription, SendTelemetryEventNotification, SendTelemetryExceptionNotification, SendProjectTelemetryEventNotification, CreateNonBalLocalComponent, GetLocalComponentDirMetaData, CreateNonBalLocalComponentFromExistingSource, getConsoleUrl, GetUserInfoRequest, GetComponentBuildStatus, GetComponentDevDeployment, OpenBillingPortal, RefreshComponentsNotification, FireRefreshComponentList, AskProjectDirPath, CloneChoreoProjectWithDir, SetExpandedComponents, GetExpandedComponents, GetChoreoWorkspaceMetadata, SetChoreoInstallOrg, ClearChoreoInstallOrg, } from "@wso2-enterprise/choreo-core";
import { ChoreoProjectClientRPCWebView } from "@wso2-enterprise/choreo-client/lib/project/rpc";
import { ChoreoGithubAppClientRPCWebView } from "@wso2-enterprise/choreo-client/lib/github/rpc/ghapp-client-rpc-webview";
import { ChoreoProjectManagerRPCWebview } from "@wso2-enterprise/choreo-client/lib/manager/rpc/manager-client-rpc-webview";
import { vscode } from "./vscode";
export class ChoreoWebViewAPI {
    constructor(vscodeAPI) {
        this._messenger = new Messenger(vscodeAPI);
        this._messenger.start();
        this._projectClientRpc = new ChoreoProjectClientRPCWebView(this._messenger);
        this._githubAppClient = new ChoreoGithubAppClientRPCWebView(this._messenger);
        this._choreoProjectManager = new ChoreoProjectManagerRPCWebview(this._messenger);
    }
    getLoginStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(GetLoginStatusRequest, HOST_EXTENSION, '');
        });
    }
    getCurrentOrg() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(GetCurrentOrgRequest, HOST_EXTENSION, '');
        });
    }
    getUserInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(GetUserInfoRequest, HOST_EXTENSION, undefined);
        });
    }
    getAllProjects(orgId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(GetAllProjectsRequest, HOST_EXTENSION, orgId);
        });
    }
    getComponents(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(GetComponents, HOST_EXTENSION, params);
        });
    }
    getDeletedComponents(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(GetDeletedComponents, HOST_EXTENSION, params);
        });
    }
    removeDeletedComponents(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this._messenger.sendRequest(RemoveDeletedComponents, HOST_EXTENSION, params);
        });
    }
    getComponentDevDeployment(component) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(GetComponentDevDeployment, HOST_EXTENSION, component);
        });
    }
    getComponentBuildStatus(component) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(GetComponentBuildStatus, HOST_EXTENSION, component);
        });
    }
    deleteComponent(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(DeleteComponent, HOST_EXTENSION, params);
        });
    }
    pullComponent(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(PullComponent, HOST_EXTENSION, params);
        });
    }
    getProjectLocation(projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(GetProjectLocation, HOST_EXTENSION, projectId);
        });
    }
    openExternal(url) {
        return __awaiter(this, void 0, void 0, function* () {
            this._messenger.sendRequest(OpenExternal, HOST_EXTENSION, url);
        });
    }
    openChoreoProject(projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(OpenChoreoProject, HOST_EXTENSION, projectId);
        });
    }
    cloneChoreoProject(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(CloneChoreoProject, HOST_EXTENSION, params);
        });
    }
    cloneChoreoProjectWithDir(project, dirPath, askOpeningOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(CloneChoreoProjectWithDir, HOST_EXTENSION, { project, dirPath, askOpeningOptions });
        });
    }
    askProjectDirPath() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(AskProjectDirPath, HOST_EXTENSION, undefined);
        });
    }
    isBareRepo(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(IsBareRepoRequest, HOST_EXTENSION, params);
        });
    }
    setExpandedComponents(projId, componentNames) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(SetExpandedComponents, HOST_EXTENSION, { projId, componentNames });
        });
    }
    getExpandedComponents(projId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(GetExpandedComponents, HOST_EXTENSION, projId);
        });
    }
    setPreferredProjectRepository(projId, repo) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(setPreferredProjectRepository, HOST_EXTENSION, { projId, repo });
        });
    }
    getPreferredProjectRepository(projId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(getPreferredProjectRepository, HOST_EXTENSION, projId);
        });
    }
    isChoreoProject() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(isChoreoProject, HOST_EXTENSION, undefined);
        });
    }
    getChoreoWorkspaceMetadata() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(GetChoreoWorkspaceMetadata, HOST_EXTENSION, undefined);
        });
    }
    getConsoleUrl() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(getConsoleUrl, HOST_EXTENSION, undefined);
        });
    }
    isSubpathAvailable(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(isSubpathAvailable, HOST_EXTENSION, params);
        });
    }
    readEndpointsYaml(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(ReadEndpointsYaml, HOST_EXTENSION, params);
        });
    }
    openBillingPortal(orgId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(OpenBillingPortal, HOST_EXTENSION, orgId);
        });
    }
    getLocalComponentDirMetaData(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(GetLocalComponentDirMetaData, HOST_EXTENSION, params);
        });
    }
    checkProjectDeleted(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(CheckProjectDeleted, HOST_EXTENSION, params);
        });
    }
    createNonBalComponent(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(CreateNonBalLocalComponent, HOST_EXTENSION, params);
        });
    }
    createNonBalLocalComponentFromExistingSource(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(CreateNonBalLocalComponentFromExistingSource, HOST_EXTENSION, params);
        });
    }
    getChoreoProject() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(getChoreoProject, HOST_EXTENSION, undefined);
        });
    }
    pushLocalComponentsToChoreo(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(PushLocalComponentsToChoreo, HOST_EXTENSION, params);
        });
    }
    pushLocalComponentToChoreo(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(PushLocalComponentToChoreo, HOST_EXTENSION, params);
        });
    }
    openArchitectureView() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(OpenArchitectureView, HOST_EXTENSION, undefined);
        });
    }
    openCellView() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(OpenCellView, HOST_EXTENSION, undefined);
        });
    }
    getDiagramComponentModel(projId, orgId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(getDiagramComponentModel, HOST_EXTENSION, { projId, orgId });
        });
    }
    onLoginStatusChanged(callback) {
        this._messenger.onNotification(LoginStatusChangedNotification, callback);
    }
    onRefreshComponents(callback) {
        this._messenger.onNotification(RefreshComponentsNotification, callback);
    }
    onSelectedOrgChanged(callback) {
        this._messenger.onNotification(SelectedOrgChangedNotification, callback);
    }
    onSelectedProjectChanged(callback) {
        this._messenger.onNotification(SelectedProjectChangedNotification, callback);
    }
    triggerCmd(cmdId, ...args) {
        return this._messenger.sendRequest(ExecuteCommandRequest, HOST_EXTENSION, [cmdId, ...args]);
    }
    getProjectClient() {
        return this._projectClientRpc;
    }
    showErrorMsg(error) {
        this._messenger.sendNotification(ShowErrorMessage, HOST_EXTENSION, error);
    }
    getChoreoGithubAppClient() {
        return this._githubAppClient;
    }
    getChoreoProjectManager() {
        return this._choreoProjectManager;
    }
    closeWebView() {
        this._messenger.sendNotification(CloseWebViewNotification, HOST_EXTENSION, undefined);
    }
    showOpenDialog(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(showOpenDialogRequest, HOST_EXTENSION, options);
        });
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new ChoreoWebViewAPI(vscode);
        }
        return this._instance;
    }
    setChoreoInstallOrg(orgId) {
        return this._messenger.sendRequest(SetChoreoInstallOrg, HOST_EXTENSION, orgId);
    }
    clearChoreoInstallOrg() {
        return this._messenger.sendRequest(ClearChoreoInstallOrg, HOST_EXTENSION, undefined);
    }
    updateProjectOverview(projectId) {
        return this._messenger.sendRequest(UpdateProjectOverview, HOST_EXTENSION, projectId);
    }
    getComponentCount() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(GetComponentCount, HOST_EXTENSION, undefined);
        });
    }
    hasChoreoSubscription() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(HasChoreoSubscription, HOST_EXTENSION, undefined);
        });
    }
    sendProjectTelemetryEvent(params) {
        return this._messenger.sendNotification(SendProjectTelemetryEventNotification, HOST_EXTENSION, params);
    }
    sendTelemetryEvent(params) {
        return this._messenger.sendNotification(SendTelemetryEventNotification, HOST_EXTENSION, params);
    }
    sendTelemetryException(params) {
        return this._messenger.sendNotification(SendTelemetryExceptionNotification, HOST_EXTENSION, params);
    }
    fireRefreshComponents() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messenger.sendRequest(FireRefreshComponentList, HOST_EXTENSION, null);
        });
    }
}
//# sourceMappingURL=WebViewRpc.js.map