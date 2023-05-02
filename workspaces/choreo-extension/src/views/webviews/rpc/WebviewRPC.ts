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
import { commands, WebviewPanel, window, Uri, ProgressLocation } from "vscode";
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
    GetEnrichedComponents,
    getPreferredProjectRepository,
    setPreferredProjectRepository,
    PushedComponent,
    RemoveDeletedComponents,
    GetComponentCount,
    CheckProjectDeleted,
    IsBareRepoRequest,
    IsBareRepoRequestParams,
    SendTelemetryEventNotification,
    SendTelemetryEventParams,
    SendTelemetryExceptionNotification,
    SendTelemetryExceptionParams
} from "@wso2-enterprise/choreo-core";
import { ComponentModel, CMDiagnostics as ComponentModelDiagnostics, GetComponentModelResponse } from "@wso2-enterprise/ballerina-languageclient";
import { registerChoreoProjectRPCHandlers } from "@wso2-enterprise/choreo-client";
import { registerChoreoGithubRPCHandlers } from "@wso2-enterprise/choreo-client/lib/github/rpc";
import { registerChoreoProjectManagerRPCHandlers, ChoreoProjectManager } from '@wso2-enterprise/choreo-client/lib/manager/';

import { ext } from "../../../extensionVariables";
import { githubAppClient, orgClient, projectClient } from "../../../auth/auth";
import { ProjectRegistry } from "../../../registry/project-registry";
import * as vscode from 'vscode';
import { cloneProject } from "../../../cmds/clone";
import { enrichConsoleDeploymentData, mergeNonClonedProjectData } from "../../../utils";
import { getLogger } from "../../../logger/logger";
import { executeWithTaskRetryPrompt } from "../../../retry";
import { refreshProjectsTreeViewCmdId } from "../../../constants";
import { initGit } from "../../../git/main";
import { dirname, join } from "path";
import { sendTelemetryEvent, sendTelemetryException } from "../../../telemetry/utils";

export class WebViewRpc {

    private _messenger = new Messenger();
    private _panel: WebviewPanel | undefined;
    private _manager = new ChoreoProjectManager();

    constructor(view: WebviewPanel) {
        this.registerPanel(view);

        this._messenger.onRequest(GetLoginStatusRequest, () => {
            return ext.api.status;
        });
        this._messenger.onRequest(GetCurrentOrgRequest, () => {
            return ext.api.selectedOrg;
        });
        this._messenger.onRequest(GetAllOrgsRequest, async () => {
            const loginSuccess = await ext.api.waitForLogin();
            if (loginSuccess) {
                const info = await executeWithTaskRetryPrompt(() => orgClient.getUserInfo());
                return info.organizations;
            }
        });
        // TODO: Remove this once the Choreo project client RPC handlers are registered
        this._messenger.onRequest(GetAllProjectsRequest, async () => {
            if (ext.api.selectedOrg) {
                return ProjectRegistry.getInstance().getProjects(ext.api.selectedOrg.id);
            }
        });

        this._messenger.onRequest(GetComponents, async (projectId: string) => {
            if (ext.api.selectedOrg) {
                return ProjectRegistry.getInstance().getComponents(projectId, ext.api.selectedOrg.handle, ext.api.selectedOrg.uuid);
            }
            return [];
        });

        this._messenger.onRequest(CheckProjectDeleted, (projectId: string) => {
            if (ext.api.selectedOrg) {
                ProjectRegistry.getInstance().checkProjectDeleted(projectId, ext.api.selectedOrg?.id)
                    .then(async (isAvailable: boolean) => {
                        if (!isAvailable) {
                            const answer = await vscode.window.showInformationMessage("This project is deleted in Choreo. Close the project?", "Yes", "No");
                            if (answer === "Yes") {
                                this.panel?.dispose();
                                await ProjectRegistry.getInstance().refreshProjects();
                                commands.executeCommand(refreshProjectsTreeViewCmdId);
                            }
                        }
                    });
            }
        });

        this._messenger.onRequest(GetDeletedComponents, async (projectId: string) => {
            if (ext.api.selectedOrg) {
                return ProjectRegistry.getInstance().getDeletedComponents(projectId, ext.api.selectedOrg.handle, ext.api.selectedOrg.uuid);
            }
        });

        this._messenger.onRequest(RemoveDeletedComponents, async (params: { projectId: string, components: PushedComponent[] }) => {
            const answer = await vscode.window.showInformationMessage("Some components are deleted in Choreo. Do you want to remove them from workspace?", "Yes", "No");
            if (answer === "Yes") {
                ProjectRegistry.getInstance().removeDeletedComponents(params.components, params.projectId);
            }
        });

        this._messenger.onRequest(GetEnrichedComponents, async (projectId: string) => {
            if (ext.api.selectedOrg) {
                return ProjectRegistry.getInstance().getEnrichedComponents(projectId, ext.api.selectedOrg.handle, ext.api.selectedOrg.uuid);
            }
            return [];
        });

        this._messenger.onRequest(DeleteComponent, async (params: { projectId: string, component: Component }) => {
            if (ext.api.selectedOrg) {
                const answer = await vscode.window.showInformationMessage("Are you sure you want to remove the component? This action will be irreversible and all related details will be lost.", "Delete Component", "Cancel");
                if (answer === "Delete Component") {
                    await ProjectRegistry.getInstance().deleteComponent(params.component, ext.api.selectedOrg.handle, params.projectId);
                    return params.component;
                }
                return null;
            }
        });

        this._messenger.onRequest(PullComponent, async (params: { projectId: string, componentId: string }) => {
            await ProjectRegistry.getInstance().pullComponent(params.componentId, params.projectId);
        });

        this._messenger.onRequest(GetComponentCount, async () => {
            if (ext.api.selectedOrg) {
                return ProjectRegistry.getInstance().getComponentCount(ext.api.selectedOrg.id);
            }
        });

        this._messenger.onRequest(GetProjectLocation, async (projectId: string) => {
            return ProjectRegistry.getInstance().getProjectLocation(projectId);
        });

        this._messenger.onRequest(OpenExternal, (url: string) => {
            vscode.env.openExternal(vscode.Uri.parse(url));
        });

        this._messenger.onRequest(OpenChoreoProject, async (projectId: string) => {
            const workspaceFilePath = ProjectRegistry.getInstance().getProjectLocation(projectId);
            if (workspaceFilePath !== undefined) {
                await commands.executeCommand("vscode.openFolder", Uri.file(workspaceFilePath));
                await commands.executeCommand("workbench.explorer.fileView.focus");
            }
        });

        this._messenger.onRequest(CloneChoreoProject, (projectId: string) => {
            if (ext.api.selectedOrg) {
                ProjectRegistry.getInstance().getProject(projectId, ext.api.selectedOrg?.id)
                    .then((project: Project | undefined) => {
                        if (project) {
                            cloneProject(project);
                        }
                    });
            }
        });

        this._messenger.onRequest(IsBareRepoRequest, async (params: IsBareRepoRequestParams) => {
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

        this._messenger.onRequest(setProjectRepository, async (params) => {
            ProjectRegistry.getInstance().setProjectRepository(params.projId, params.repo);
        });

        this._messenger.onRequest(getProjectRepository, (projectId: string) => {
            return ProjectRegistry.getInstance().getProjectRepository(projectId);
        });

        this._messenger.onRequest(setPreferredProjectRepository, async (params) => {
            ProjectRegistry.getInstance().setPreferredProjectRepository(params.projId, params.repo);
        });

        this._messenger.onRequest(getPreferredProjectRepository, (projectId: string) => {
            return ProjectRegistry.getInstance().getPreferredProjectRepository(projectId);
        });

        this._messenger.onRequest(isChoreoProject, () => {
            return ext.api.isChoreoProject();
        });

        this._messenger.onRequest(isSubpathAvailable, (params: SubpathAvailableRequest) => {
            return ProjectRegistry.getInstance().isSubpathAvailable(params.projectID, params.orgName, params.repoName, params.subpath);
        });

        this._messenger.onRequest(getChoreoProject, () => {
            return ext.api.getChoreoProject();
        });

        this._messenger.onRequest(OpenArchitectureView, () => {
            commands.executeCommand("ballerina.view.architectureView");
        });

        this._messenger.onRequest(getDiagramComponentModel, async (params): Promise<GetComponentModelResponse> => {
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

        this._messenger.onRequest(UpdateProjectOverview, (projectId: string) => {
            ext.api.projectUpdated();
        });

        this._messenger.onRequest(PushLocalComponentsToChoreo, async (projectId: string): Promise<void> => {
            if (ext.api.selectedOrg) {
                await ProjectRegistry.getInstance().pushLocalComponentsToChoreo(projectId, ext.api.selectedOrg);
            }
        });

        this._messenger.onRequest(PushLocalComponentToChoreo, async (params: { projectId: string, componentName: string }): Promise<void> => {
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
            this._messenger.sendNotification(LoginStatusChangedNotification, BROADCAST, newStatus);
        });
        ext.api.onOrganizationChanged((newOrg) => {
            this._messenger.sendNotification(SelectedOrgChangedNotification, BROADCAST, newOrg);
        });
        ext.api.onChoreoProjectChanged((projectId) => {
            this._messenger.sendNotification(SelectedProjectChangedNotification, BROADCAST, projectId);
        });
        this._messenger.onRequest(ExecuteCommandRequest, async (args: string[]) => {
            if (args.length >= 1) {
                const cmdArgs = args.length > 1 ? args.slice(1) : [];
                const result = await commands.executeCommand(args[0], ...cmdArgs);
                return result;
            }
        });
        this._messenger.onNotification(ShowErrorMessage, (error: string) => {
            window.showErrorMessage(error);
        });
        this._messenger.onNotification(CloseWebViewNotification, () => {
            view.dispose();
        });

        this._messenger.onRequest(showOpenDialogRequest, async (options: OpenDialogOptions) => {
            try {
                const result = await window.showOpenDialog({ ...options, defaultUri: Uri.parse(options.defaultUri) });
                return result?.map((file) => file.fsPath);
            } catch (error: any) {
                getLogger().error(error.message);
                return [];
            }
        });

        this._messenger.onNotification(SendTelemetryEventNotification, (event: SendTelemetryEventParams) => {
            sendTelemetryEvent(event.eventName, event.properties, event.measurements);
        });

        this._messenger.onNotification(SendTelemetryExceptionNotification, (event: SendTelemetryExceptionParams) => {
            sendTelemetryException(event.error, event.properties, event.measurements);
        });

        // Register RPC handlers for Choreo project client
        registerChoreoProjectRPCHandlers(this._messenger, projectClient);

        // Register RPC handlers for Choreo Github app client
        registerChoreoGithubRPCHandlers(this._messenger, githubAppClient);

        // Register RPC handlers for the Choreo Project Manager
        registerChoreoProjectManagerRPCHandlers(this._messenger, this._manager);
    }

    public get panel(): WebviewPanel | undefined {
        return this._panel;
    }

    public registerPanel(view: WebviewPanel) {
        if (!this._panel) {
            this._messenger.registerWebviewPanel(view, { broadcastMethods: ['loginStatusChanged', 'selectedOrgChanged', 'selectedProjectChanged', 'ghapp/onGHAppAuthCallback'] });
            this._panel = view;
        } else {
            throw new Error("Panel already registered");
        }
    }
}
