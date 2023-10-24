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
import { commands, WebviewPanel, window, Uri, ProgressLocation, WebviewView } from "vscode";
import { Messenger } from "vscode-messenger";
import { BROADCAST } from 'vscode-messenger-common';
import {
    GetCurrentOrgRequest, GetAllProjectsRequest,
    GetLoginStatusRequest, ExecuteCommandRequest,
    LoginStatusChangedNotification, SelectedOrgChangedNotification,
    CloseWebViewNotification,
    SelectedProjectChangedNotification,
    Project, GetComponents, GetProjectLocation, OpenExternal, OpenChoreoProject, CloneChoreoProject,
    ShowErrorMessage, isChoreoProject, getChoreoProject,
    PushLocalComponentsToChoreo,
    OpenArchitectureView,
    Component, UpdateProjectOverview,
    isSubpathAvailable,
    SubpathAvailableRequest,
    getDiagramComponentModel,
    DeleteComponent,
    PullComponent,
    PushLocalComponentToChoreo,
    showOpenDialogRequest,
    OpenDialogOptions,
    GetDeletedComponents,
    getPreferredProjectRepository,
    setPreferredProjectRepository,
    PushedComponent,
    RemoveDeletedComponents,
    GetComponentCount,
    CheckProjectDeleted,
    IsBareRepoRequest,
    IsBareRepoRequestParams,
    HasChoreoSubscription,
    SendTelemetryEventNotification,
    SendTelemetryEventParams,
    SendTelemetryExceptionNotification,
    SendTelemetryExceptionParams,
    SendProjectTelemetryEventNotification,
    CreateNonBalLocalComponent,
    CreateNonBalLocalComponentFromExistingSource,
    GetLocalComponentDirMetaData,
    getLocalComponentDirMetaDataRequest,
    getConsoleUrl,
    ChoreoComponentCreationParams,
    GetUserInfoRequest,
    GetComponentBuildStatus,
    GetComponentDevDeployment,
    ReadEndpointsYaml,
    OpenBillingPortal,
    RefreshComponentsNotification,
    FireRefreshComponentList,
    FireRefreshWorkspaceMetadata,
    OpenCellView,
    AskProjectDirPath,
    CloneChoreoProjectWithDir,
    GetComponentsRequestParams,
    CheckProjectDeletedParams,
    GetDeletedComponentsParams,
    GetComponentCountParams,
    HasChoreoSubscriptionParams,
    CloneChoreoProjectParams,
    PushLocalComponentsToChoreoParams,
    SetExpandedComponents,
    GetExpandedComponents,
    GetChoreoWorkspaceMetadata,
    SetChoreoInstallOrg,
    ClearChoreoInstallOrg,
    getEndpointsForVersion,
    EndpointData,
    SetWebviewCache,
    RestoreWebviewCache,
    ClearWebviewCache,
    GoToSource,
    IsBallerinaExtInstalled,
    RefreshWorkspaceNotification,
    GetBuildPackParams,
    GetBuildpack,
} from "@wso2-enterprise/choreo-core";
import { ComponentModel, CMDiagnostics as ComponentModelDiagnostics, GetComponentModelResponse } from "@wso2-enterprise/ballerina-languageclient";
import { registerChoreoProjectRPCHandlers } from "@wso2-enterprise/choreo-client";
import { registerChoreoGithubRPCHandlers } from "@wso2-enterprise/choreo-client/lib/github/rpc";
import { registerChoreoProjectManagerRPCHandlers, ChoreoProjectManager } from '@wso2-enterprise/choreo-client/lib/manager/';

import { ext } from "../../../extensionVariables";
import { ProjectRegistry } from "../../../registry/project-registry";
import * as vscode from 'vscode';
import { cloneProject, askProjectDirPath } from "../../../cmds/clone";
import { enrichConsoleDeploymentData, mergeNonClonedProjectData } from "../../../utils";
import { getLogger } from "../../../logger/logger";
import { executeWithTaskRetryPrompt } from "../../../retry";
import { initGit } from "../../../git/main";
import { dirname, join } from "path";
import { sendProjectTelemetryEvent, sendTelemetryEvent, sendTelemetryException } from "../../../telemetry/utils";
import { existsSync } from "fs";

const manager = new ChoreoProjectManager();

// Register handlers
export function registerWebviewRPCHandlers(messenger: Messenger, view: WebviewPanel | WebviewView) {
    messenger.onRequest(GetLoginStatusRequest, () => {
        return ext.api.status;
    });
    messenger.onRequest(GetCurrentOrgRequest, () => {
        return ext.api.getSelectedOrg();
    });

    messenger.onRequest(GetUserInfoRequest, async () => {
        return ext.api.userInfo;
    });

    // TODO: Remove this once the Choreo project client RPC handlers are registered
    messenger.onRequest(GetAllProjectsRequest, async (orgId: number) => {
        const org = ext.api.getOrgById(orgId);
        if (org) {
            return ProjectRegistry.getInstance().getProjects(orgId, org.handle);
        }
        return [];
    });

    messenger.onRequest(GetComponents, async (params: GetComponentsRequestParams) => {
        const { orgId, projectId } = params;
        const org = ext.api.getOrgById(orgId);
        if (org) {
            return ProjectRegistry.getInstance().getComponents(projectId, org.id, org.handle, org.uuid);
        }
        return [];
    });

    messenger.onRequest(CheckProjectDeleted, (params: CheckProjectDeletedParams) => {
        const { orgId, projectId } = params;
        const org = ext.api.getOrgById(orgId);
        if (org) {
            return ProjectRegistry.getInstance().checkProjectDeleted(projectId, orgId, org.handle);
        }
        return false;
    });

    messenger.onRequest(GetDeletedComponents, async (params: GetDeletedComponentsParams) => {
        const { orgId, projectId } = params;
        const org = ext.api.getOrgById(orgId);
        if (org) {
            return ProjectRegistry.getInstance().getDeletedComponents(projectId, org.id, org.handle, org.uuid);
        }
    });

    messenger.onRequest(CreateNonBalLocalComponent, async (params: ChoreoComponentCreationParams) => {
        return ProjectRegistry.getInstance().createNonBalLocalComponent(params);
    });

    messenger.onRequest(CreateNonBalLocalComponentFromExistingSource, async (params: ChoreoComponentCreationParams) => {
        return ProjectRegistry.getInstance().createNonBalLocalComponentFromExistingSource(params);
    });

    messenger.onRequest(GetBuildpack, async (params: GetBuildPackParams) => {
        const { orgId, componentType } = params;
        const org = ext.api.getOrgById(orgId);
        if (org) {
            return ProjectRegistry.getInstance().getBuildpack(org.id, org.uuid, componentType);
        }
        return false;
    });

    messenger.onRequest(RemoveDeletedComponents, async (params: { projectId: string, components: PushedComponent[] }) => {
        const answer = await vscode.window.showInformationMessage("Some components are deleted in Choreo. Do you want to remove them from workspace?", "Yes", "No");
        if (answer === "Yes") {
            ProjectRegistry.getInstance().removeDeletedComponents(params.components, params.projectId);
        }
    });

    messenger.onRequest(GetComponentDevDeployment, async (component: Component) => {
        const { orgHandler } = component;
        const org = ext.api.getOrgByHandle(orgHandler);
        if (org) {
            return ProjectRegistry.getInstance().getComponentDevDeployment(component, org.id, org.handle, org.uuid);
        }
        return null;
    });

    messenger.onRequest(GetComponentBuildStatus, async (component: Component) => {
        const org = ext.api.getOrgByHandle(component.orgHandler);
        if (!org) {
            return null;
        }
        return ProjectRegistry.getInstance().getComponentBuildStatus(org.id, org.handle, component);
    });

    messenger.onRequest(DeleteComponent, async (params: { projectId: string, component: Component }) => {
        const { orgHandler, displayName } = params.component;
        const org = ext.api.getOrgByHandle(orgHandler);
        if (org) {
            const answer = await vscode.window.showWarningMessage(`Are you sure you want to delete the component ${displayName}? `,
                { modal: true },
                "Delete Component");
            if (answer === "Delete Component") {
                await ProjectRegistry.getInstance().deleteComponent(params.component, org.id, org.handle, params.projectId);
                return params.component;
            }
            return null;
        }
    });

    messenger.onRequest(getEndpointsForVersion, async (params: { componentId: string, versionId: string, orgId: number }) : Promise<EndpointData | null> => {
        return await ProjectRegistry.getInstance().getEndpointsForVersion(
            params.componentId, params.versionId, params.orgId
        );
    });

    messenger.onRequest(PullComponent, async (params: { projectId: string, componentId: string }) => {
        const project = await ext.api.getChoreoProject();
        if (!project) {
            throw new Error("Project not found");
        }
        const org = ext.api.getOrgById(parseInt(project.orgId));
        if (!org) {
            throw new Error("Org not found");
        }
        await ProjectRegistry.getInstance().pullComponent(org.id, params.componentId, params.projectId);
    });

    messenger.onRequest(GetComponentCount, async (params: GetComponentCountParams) => {
        const { orgId, } = params;
        const org = ext.api.getOrgById(orgId);
        if (org) {
            return ProjectRegistry.getInstance().getComponentCount(orgId);
        }
    });

    messenger.onRequest(HasChoreoSubscription, async (params: HasChoreoSubscriptionParams) => {
        const { orgId } = params;
        const org = ext.api.getOrgById(orgId);
        if (org) {
            return ProjectRegistry.getInstance().hasChoreoSubscription(orgId);
        }
    });

    messenger.onRequest(GetProjectLocation, async (projectId: string) => {
        return ProjectRegistry.getInstance().getProjectLocation(projectId);
    });

    messenger.onRequest(OpenExternal, (url: string) => {
        vscode.env.openExternal(vscode.Uri.parse(url));
    });

    messenger.onRequest(OpenChoreoProject, async (projectId: string) => {
        const workspaceFilePath = ProjectRegistry.getInstance().getProjectLocation(projectId);
        if (workspaceFilePath !== undefined) {
            await commands.executeCommand("vscode.openFolder", Uri.file(workspaceFilePath));
            await commands.executeCommand("workbench.explorer.fileView.focus");
        }
    });

    messenger.onRequest(CloneChoreoProject, (params: CloneChoreoProjectParams) => {
        const { orgId, projectId } = params;
        const org = ext.api.getOrgById(orgId);
        if (org) {
            ProjectRegistry.getInstance().getProject(projectId, orgId, org.handle)
                .then((project: Project | undefined) => {
                    if (project) {
                        cloneProject(project);
                    }
                });
        }
    });

    messenger.onRequest(AskProjectDirPath, async () => {
        return await askProjectDirPath();
    });

    messenger.onRequest(CloneChoreoProjectWithDir, (params: { project: Project, dirPath: string, askOpeningOptions?: boolean }) => {
        cloneProject(params.project, params.dirPath, params.askOpeningOptions);
    });

    messenger.onRequest(IsBareRepoRequest, async (params: IsBareRepoRequestParams) => {
        const projectLocation: string | undefined = ProjectRegistry.getInstance().getProjectLocation(params.projectID);
        if (projectLocation) {
            const repoPath = join(dirname(projectLocation), 'repos', params.orgName, params.repoName);
            const git = await initGit(ext.context);
            if (git) {
                return git.isEmptyRepository(repoPath);
            } else {
                getLogger().error("Git is not initialized, cannot check if the repo is bare.");
            }
        } else {
            getLogger().error("Project location is not found for the project: " + params.projectID);
        }
        return false;
    });

    messenger.onRequest(SetExpandedComponents, async (params) => {
        ProjectRegistry.getInstance().setExpandedComponents(params.projId, params.componentNames);
    });

    messenger.onRequest(GetExpandedComponents, (projectId: string) => {
        return ProjectRegistry.getInstance().getExpandedComponents(projectId);
    });

    messenger.onRequest(setPreferredProjectRepository, async (params) => {
        ProjectRegistry.getInstance().setPreferredProjectRepository(params.projId, params.repo);
    });

    messenger.onRequest(getPreferredProjectRepository, (projectId: string) => {
        return ProjectRegistry.getInstance().getPreferredProjectRepository(projectId);
    });

    messenger.onRequest(isChoreoProject, () => {
        return ext.api.isChoreoProject();
    });

    messenger.onRequest(GetChoreoWorkspaceMetadata, () => {
        return ext.api.getChoreoWorkspaceMetadata();
    });

    messenger.onRequest(getConsoleUrl, () => {
        return ProjectRegistry.getInstance().getConsoleUrl();
    });

    messenger.onRequest(isSubpathAvailable, (params: SubpathAvailableRequest) => {
        return ProjectRegistry.getInstance().isSubpathAvailable(params.projectID, params.orgName, params.repoName, params.subpath);
    });

    messenger.onRequest(ReadEndpointsYaml, (params: SubpathAvailableRequest) => {
        return ProjectRegistry.getInstance().readEndpointsYaml(params.projectID, params.orgName, params.repoName, params.subpath);
    });

    messenger.onRequest(OpenBillingPortal, (orgId: string) => {
        return ProjectRegistry.getInstance().openBillingPortal(orgId);
    });

    messenger.onRequest(getChoreoProject, () => {
        return ext.api.getChoreoProject();
    });

    messenger.onRequest(OpenArchitectureView, () => {
        commands.executeCommand("ballerina.view.architectureView");
    });

    messenger.onRequest(OpenCellView, () => {
        commands.executeCommand("ballerina.view.cellView");
    });

    messenger.onRequest(getDiagramComponentModel, async (params): Promise<GetComponentModelResponse> => {
        let componentModels: { [key: string]: ComponentModel } = {};
        let diagnostics: ComponentModelDiagnostics[] = [];
        const org = ext.api.getOrgById(params.orgId);
        if (!org) {
            throw new Error("Org not found");
        }
        await ProjectRegistry.getInstance().getDiagramModel(params.projId, params.orgId, org.handle)
            .then(async (component) => {
                component.forEach((value, _key) => {
                    // Draw the cell diagram for the last version of the component
                    const finalVersion = value.apiVersions[value.apiVersions.length - 1];
                    if (finalVersion.cellDiagram?.success) {
                        const decodedString = Buffer.from(finalVersion.cellDiagram.data, "base64");
                        const model: ComponentModel = JSON.parse(decodedString.toString());
                        enrichConsoleDeploymentData(model.services, finalVersion);
                        componentModels[`${model.orgName}/${model.id}:${model.version}`] = model;
                    } else {
                        componentModels[`${value.orgHandler}/${value.name}:${value.version}`] = mergeNonClonedProjectData(value);
                        diagnostics.push({ name: `${value.displayName} Component` });
                    }
                });
            }).catch((error: any) => {
                getLogger().error(`Error while getting diagram model for project ${params.projId}. ${error?.message} ${error?.cause ? error.cause : ""}`);
            });

        return {
            componentModels: componentModels,
            diagnostics: diagnostics
        };
    });

    messenger.onRequest(SetChoreoInstallOrg, (orgId: number) => {
        ext.api.setChoreoInstallOrg(orgId);
    });

    messenger.onRequest(ClearChoreoInstallOrg, () => {
        ext.api.clearChoreoInstallOrg();
    });

    messenger.onRequest(UpdateProjectOverview, (projectId: string) => {
        ext.api.projectUpdated();
    });

    messenger.onRequest(PushLocalComponentsToChoreo, async function (params: PushLocalComponentsToChoreoParams): Promise<string[]> {
        const { orgId, projectId, componentNames } = params;
        const org = ext.api.getOrgById(orgId);
        if (org) {
            return ProjectRegistry.getInstance().pushLocalComponentsToChoreo(projectId, componentNames, org);
        }
        return [];
    });

    messenger.onRequest(PushLocalComponentToChoreo, async (params: { projectId: string, componentName: string }): Promise<void> => {
        return window.withProgress({
            title: `Pushing the ${params.componentName} component from your local machine to Choreo.`,
            location: ProgressLocation.Notification,
            cancellable: false
        }, async (_progress, cancellationToken) => {
            const org = await ext.api.getSelectedOrg();
            if (org){
                await ProjectRegistry.getInstance().pushLocalComponentToChoreo(params.projectId, params.componentName, org);
            }
        });
    });

    messenger.onRequest(GoToSource, async (filePath): Promise<void> => {
        if (existsSync(filePath)) {
            const sourceFile = await vscode.workspace.openTextDocument(filePath);
            await window.showTextDocument(sourceFile);
            await commands.executeCommand("workbench.explorer.fileView.focus");
        }
    });

    ext.api.onStatusChanged((newStatus) => {
        messenger.sendNotification(LoginStatusChangedNotification, BROADCAST, newStatus);
    });
    ext.api.onOrganizationChanged((newOrg) => {
        messenger.sendNotification(SelectedOrgChangedNotification, BROADCAST, newOrg);
    });
    ext.api.onChoreoProjectChanged((projectId) => {
        messenger.sendNotification(SelectedProjectChangedNotification, BROADCAST, projectId);
    });

    ext.api.onRefreshComponentList(() => {
        messenger.sendNotification(RefreshComponentsNotification, BROADCAST, null);
    });

    ext.api.onRefreshWorkspaceMetadata(() => {
            messenger.sendNotification(RefreshWorkspaceNotification, BROADCAST, null);
        });
    messenger.onRequest(ExecuteCommandRequest, async (args: string[]) => {
        if (args.length >= 1) {
            const cmdArgs = args.length > 1 ? args.slice(1) : [];
            const result = await commands.executeCommand(args[0], ...cmdArgs);
            return result;
        }
    });
    messenger.onNotification(ShowErrorMessage, (error: string) => {
        window.showErrorMessage(error);
    });
    messenger.onNotification(CloseWebViewNotification, () => {
        if ('dispose' in view) {
            view.dispose();
        }
    });

    messenger.onRequest(showOpenDialogRequest, async (options: OpenDialogOptions) => {
        try {
            const result = await window.showOpenDialog({ ...options, defaultUri: Uri.parse(options.defaultUri) });
            return result?.map((file) => file.fsPath);
        } catch (error: any) {
            getLogger().error(error.message);
            return [];
        }
    });

    messenger.onRequest(FireRefreshComponentList, () => {
        ext.api.refreshComponentList();
    });

    messenger.onRequest(FireRefreshWorkspaceMetadata, () => {
        ext.api.refreshWorkspaceMetadata();
    });

    messenger.onRequest(SetWebviewCache, async (params) => {
        await ext.context.workspaceState.update(params.cacheKey, params.data);
    });

    messenger.onRequest(RestoreWebviewCache, async (cacheKey) => {
        return ext.context.workspaceState.get(cacheKey);
    });

    messenger.onRequest(ClearWebviewCache, async (cacheKey) => {
        await ext.context.workspaceState.update(cacheKey, undefined);
    });

    messenger.onRequest(IsBallerinaExtInstalled, () => {
        const ext = vscode.extensions.getExtension("wso2.ballerina");
        return !!ext;
    });

    messenger.onRequest(GetLocalComponentDirMetaData, (params: getLocalComponentDirMetaDataRequest) => {
        return ProjectRegistry.getInstance().getLocalComponentDirMetaData(params);
    });

    messenger.onNotification(SendTelemetryEventNotification, (event: SendTelemetryEventParams) => {
        sendTelemetryEvent(event.eventName, event.properties, event.measurements);
    });

    messenger.onNotification(SendProjectTelemetryEventNotification, (event: SendTelemetryEventParams) => {
        sendProjectTelemetryEvent(event.eventName, event.properties, event.measurements);
    });

    messenger.onNotification(SendTelemetryExceptionNotification, (event: SendTelemetryExceptionParams) => {
        sendTelemetryException(event.error, event.properties, event.measurements);
    });

    // Register RPC handlers for Choreo project client
    registerChoreoProjectRPCHandlers(messenger, ext.clients.projectClient);

    // Register RPC handlers for Choreo Github app client
    registerChoreoGithubRPCHandlers(messenger, ext.clients.githubAppClient);

    // Register RPC handlers for the Choreo Project Manager
    registerChoreoProjectManagerRPCHandlers(messenger, manager);
}

export class WebViewPanelRpc {

    private _messenger = new Messenger();
    private _panel: WebviewPanel | undefined;

    constructor(view: WebviewPanel) {
        this.registerPanel(view);
        registerWebviewRPCHandlers(this._messenger, view);
    }

    public get panel(): WebviewPanel | undefined {
        return this._panel;
    }

    public registerPanel(view: WebviewPanel) {
        if (!this._panel) {
            this._messenger.registerWebviewPanel(view, { broadcastMethods: ['loginStatusChanged', 'selectedOrgChanged', 'selectedProjectChanged', 'ghapp/onGHAppAuthCallback', 'refreshComponents', 'refreshWorkspace'] });
            this._panel = view;
        } else {
            throw new Error("Panel already registered");
        }
    }
}

export class WebViewViewRPC {

    private _messenger = new Messenger();
    private _view: WebviewView | undefined;

    constructor(view: WebviewView) {
        this.registerView(view);
        registerWebviewRPCHandlers(this._messenger, view);
    }

    public get view(): WebviewView | undefined {
        return this._view;
    }

    public registerView(view: WebviewView) {
        if (!this._view) {
            this._messenger.registerWebviewView(view, { broadcastMethods: ['loginStatusChanged', 'selectedOrgChanged', 'selectedProjectChanged', 'ghapp/onGHAppAuthCallback', 'refreshComponents', 'refreshWorkspace'] });
            this._view = view;
        } else {
            throw new Error("View already registered");
        }
    }
}
