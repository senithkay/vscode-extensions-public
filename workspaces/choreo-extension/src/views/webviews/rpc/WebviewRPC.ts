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
    GetAllOrgsRequest, GetCurrentOrgRequest, GetAllProjectsRequest,
    GetLoginStatusRequest, ExecuteCommandRequest,
    LoginStatusChangedNotification, SelectedOrgChangedNotification,
    CloseWebViewNotification,
    SelectedProjectChangedNotification,
    Project, GetComponents, GetProjectLocation, OpenExternal, OpenChoreoProject, CloneChoreoProject,
    ShowErrorMessage, setProjectRepository, getProjectRepository, isChoreoProject, getChoreoProject,
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
    OpenCellView,
    AskProjectDirPath,
    CloneChoreoProjectWithDir,
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
import { refreshProjectsTreeViewCmdId } from "../../../constants";
import { initGit } from "../../../git/main";
import { dirname, join } from "path";
import { sendProjectTelemetryEvent, sendTelemetryEvent, sendTelemetryException } from "../../../telemetry/utils";

const manager = new ChoreoProjectManager();

// Register handlers
export function registerWebviewRPCHandlers(messenger: Messenger, view: WebviewPanel | WebviewView) {
    messenger.onRequest(GetLoginStatusRequest, () => {
        return ext.api.status;
    });
    messenger.onRequest(GetCurrentOrgRequest, () => {
        return ext.api.selectedOrg;
    });
    messenger.onRequest(GetAllOrgsRequest, async () => {
        const loginSuccess = await ext.api.waitForLogin();
        if (loginSuccess) {
            const organizations = await executeWithTaskRetryPrompt(() => ext.clients.orgClient.getOrganizations());
            return organizations;
        }
    });

    messenger.onRequest(GetUserInfoRequest, async () => {
        return ext.api.userInfo;
    });

    // TODO: Remove this once the Choreo project client RPC handlers are registered
    messenger.onRequest(GetAllProjectsRequest, async () => {
        if (ext.api.selectedOrg) {
            return ProjectRegistry.getInstance().getProjects(ext.api.selectedOrg.id);
        }
    });

    messenger.onRequest(GetComponents, async (projectId: string) => {
        if (ext.api.selectedOrg) {
            return ProjectRegistry.getInstance().getComponents(projectId, ext.api.selectedOrg.handle, ext.api.selectedOrg.uuid);
        }
        return [];
    });

    messenger.onRequest(CheckProjectDeleted, (projectId: string) => {
        if (ext.api.selectedOrg) {
            return ProjectRegistry.getInstance().checkProjectDeleted(projectId, ext.api.selectedOrg?.id);
        }
        return false;
    });

    messenger.onRequest(GetDeletedComponents, async (projectId: string) => {
        if (ext.api.selectedOrg) {
            return ProjectRegistry.getInstance().getDeletedComponents(projectId, ext.api.selectedOrg.handle, ext.api.selectedOrg.uuid);
        }
    });

    messenger.onRequest(CreateNonBalLocalComponent, async (params: ChoreoComponentCreationParams) => {
        return ProjectRegistry.getInstance().createNonBalLocalComponent(params);
    });

    messenger.onRequest(CreateNonBalLocalComponentFromExistingSource, async (params: ChoreoComponentCreationParams) => {
        return ProjectRegistry.getInstance().createNonBalLocalComponentFromExistingSource(params);
    });

    messenger.onRequest(RemoveDeletedComponents, async (params: { projectId: string, components: PushedComponent[] }) => {
        const answer = await vscode.window.showInformationMessage("Some components are deleted in Choreo. Do you want to remove them from workspace?", "Yes", "No");
        if (answer === "Yes") {
            ProjectRegistry.getInstance().removeDeletedComponents(params.components, params.projectId);
        }
    });

    messenger.onRequest(GetComponentDevDeployment, async (component: Component) => {
        if (ext.api.selectedOrg) {
            return ProjectRegistry.getInstance().getComponentDevDeployment(component, ext.api.selectedOrg.handle, ext.api.selectedOrg.uuid);
        }
        return null;
    });

    messenger.onRequest(GetComponentBuildStatus, async (component: Component) => {
        return ProjectRegistry.getInstance().getComponentBuildStatus(component);
    });

    messenger.onRequest(DeleteComponent, async (params: { projectId: string, component: Component }) => {
        if (ext.api.selectedOrg) {
            const answer = await vscode.window.showInformationMessage("Are you sure you want to remove the component? This action will be irreversible and all related details will be lost.", "Delete Component", "Cancel");
            if (answer === "Delete Component") {
                await ProjectRegistry.getInstance().deleteComponent(params.component, ext.api.selectedOrg.handle, params.projectId);
                return params.component;
            }
            return null;
        }
    });

    messenger.onRequest(PullComponent, async (params: { projectId: string, componentId: string }) => {
        await ProjectRegistry.getInstance().pullComponent(params.componentId, params.projectId);
    });

    messenger.onRequest(GetComponentCount, async () => {
        if (ext.api.selectedOrg) {
            return ProjectRegistry.getInstance().getComponentCount(ext.api.selectedOrg.id);
        }
    });

    messenger.onRequest(HasChoreoSubscription, async () => {
        if (ext.api.selectedOrg) {
            return ProjectRegistry.getInstance().hasChoreoSubscription(ext.api.selectedOrg.uuid);
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

    messenger.onRequest(CloneChoreoProject, (projectId: string) => {
        if (ext.api.selectedOrg) {
            ProjectRegistry.getInstance().getProject(projectId, ext.api.selectedOrg?.id)
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

    messenger.onRequest(CloneChoreoProjectWithDir, (params: { project: Project, dirPath: string }) => {
        if (ext.api.selectedOrg) {
            cloneProject(params.project, params.dirPath );
        }
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

    messenger.onRequest(setProjectRepository, async (params) => {
        ProjectRegistry.getInstance().setProjectRepository(params.projId, params.repo);
    });

    messenger.onRequest(getProjectRepository, (projectId: string) => {
        return ProjectRegistry.getInstance().getProjectRepository(projectId);
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
        await ProjectRegistry.getInstance().getDiagramModel(params.projId, params.orgHandler)
            .then(async (component) => {
                component.forEach((value, _key) => {
                    // Draw the cell diagram for the last version of the component
                    const finalVersion = value.apiVersions[value.apiVersions.length - 1];
                    if (finalVersion.cellDiagram?.success) {
                        const decodedString = Buffer.from(finalVersion.cellDiagram.data, "base64");
                        const model: ComponentModel = JSON.parse(decodedString.toString());
                        enrichConsoleDeploymentData(model.services, finalVersion);
                        componentModels[`${model.packageId.org}/${model.packageId.name}:${model.packageId.version}`] = model;
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

    messenger.onRequest(UpdateProjectOverview, (projectId: string) => {
        ext.api.projectUpdated();
    });

    messenger.onRequest(PushLocalComponentsToChoreo, async (projectId: string): Promise<void> => {
        if (ext.api.selectedOrg) {
            await ProjectRegistry.getInstance().pushLocalComponentsToChoreo(projectId, ext.api.selectedOrg);
        }
    });

    messenger.onRequest(PushLocalComponentToChoreo, async (params: { projectId: string, componentName: string }): Promise<void> => {
        return window.withProgress({
            title: `Pushing the ${params.componentName} component from your local machine to Choreo.`,
            location: ProgressLocation.Notification,
            cancellable: false
        }, async (_progress, cancellationToken) => {
            if (ext.api.selectedOrg) {
                await ProjectRegistry.getInstance().pushLocalComponentToChoreo(params.projectId, params.componentName);
            }
        });
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
            this._messenger.registerWebviewPanel(view, { broadcastMethods: ['loginStatusChanged', 'selectedOrgChanged', 'selectedProjectChanged', 'ghapp/onGHAppAuthCallback', 'refreshComponents'] });
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
            this._messenger.registerWebviewView(view, { broadcastMethods: ['loginStatusChanged', 'selectedOrgChanged', 'selectedProjectChanged', 'ghapp/onGHAppAuthCallback', 'refreshComponents'] });
            this._view = view;
        } else {
            throw new Error("View already registered");
        }
    }
}
