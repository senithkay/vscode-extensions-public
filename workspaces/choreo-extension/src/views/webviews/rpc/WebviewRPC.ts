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
import { commands, Uri, WebviewPanel } from "vscode";
import { Messenger } from "vscode-messenger";
import { BROADCAST } from 'vscode-messenger-common';
import {
    GetAllOrgsRequest, GetCurrentOrgRequest, GetAllProjectsRequest,
    GetLoginStatusRequest, ExecuteCommandNotification,
    LoginStatusChangedNotification, SelectedOrgChangedNotification,
    CloseWebViewNotification, serializeError,
    SelectedProjectChangedNotification,
    Project, GetComponents, GetProjectLocation, OpenExternal, OpenChoreoProject, CloneChoreoProject
} from "@wso2-enterprise/choreo-core";
import { registerChoreoProjectRPCHandlers } from "@wso2-enterprise/choreo-client";
import { registerChoreoGithubRPCHandlers } from "@wso2-enterprise/choreo-client/lib/github/rpc";

import { ext } from "../../../extensionVariables";
import { githubAppClient, orgClient, projectClient } from "../../../auth/auth";
import { ProjectRegistry } from "../../../registry/project-registry";
import * as vscode from 'vscode';
import { cloneProject } from "../../../cmds/clone";

export class WebViewRpc {

    private _messenger = new Messenger();

    constructor(view: WebviewPanel) {
        this._messenger.registerWebviewPanel(view, { broadcastMethods: ['loginStatusChanged', 'selectedOrgChanged', 'selectedProjectChanged', 'ghapp/onGHAppAuthCallback'] });

        this._messenger.onRequest(GetLoginStatusRequest, () => {
            return ext.api.status;
        });
        this._messenger.onRequest(GetCurrentOrgRequest, () => {
            return ext.api.selectedOrg;
        });
        this._messenger.onRequest(GetAllOrgsRequest, async () => {
            const loginSuccess = await ext.api.waitForLogin();
            if (loginSuccess) {
                return orgClient.getUserInfo()
                    .then((userInfo) => userInfo.organizations)
                    .catch(serializeError);
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
                return ProjectRegistry.getInstance().getComponents(projectId, ext.api.selectedOrg.handle);
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

        ext.api.onStatusChanged((newStatus) => {
            this._messenger.sendNotification(LoginStatusChangedNotification, BROADCAST, newStatus);
        });
        ext.api.onOrganizationChanged((newOrg) => {
            this._messenger.sendNotification(SelectedOrgChangedNotification, BROADCAST, newOrg);
        });
        ext.api.onChoreoProjectChanged((projectId) => {
            this._messenger.sendNotification(SelectedProjectChangedNotification, BROADCAST, projectId);
        });
        this._messenger.onNotification(ExecuteCommandNotification, (args: string[]) => {
            if (args.length >= 1) {
                const cmdArgs = args.length > 1 ? args.slice(1) : [];
                commands.executeCommand(args[0], ...cmdArgs);
            }
        });
        this._messenger.onNotification(CloseWebViewNotification, () => {
            view.dispose();
        });

        // Register RPC handlers for Choreo project client
        registerChoreoProjectRPCHandlers(this._messenger, projectClient);

        // Register RPC handlers for Choreo Github app client
        registerChoreoGithubRPCHandlers(this._messenger, githubAppClient);
    }
}
