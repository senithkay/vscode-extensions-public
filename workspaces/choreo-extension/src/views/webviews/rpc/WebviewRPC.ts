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
import { commands, WebviewPanel } from "vscode";
import { Messenger } from "vscode-messenger";
import { BROADCAST } from 'vscode-messenger-common';
import {
    GetAllOrgsRequest, GetCurrentOrgRequest, GetAllProjectsRequest,
    GetLoginStatusRequest, ExecuteCommandNotification,
    LoginStatusChangedNotification, SelectedOrgChangedNotification  } from "@wso2-enterprise/choreo-core";
import { registerChoreoProjectRPCHandlers } from "@wso2-enterprise/choreo-client";
import { ext } from "../../../extensionVariables";
import { orgClient, projectClient } from "../../../auth/auth";

export class WebViewRpc {

    private _messenger = new Messenger();

    constructor(view: WebviewPanel) {
        this._messenger.registerWebviewPanel(view, { broadcastMethods: ['loginStatusChanged', 'selectedOrgChanged'] });

        this._messenger.onRequest(GetLoginStatusRequest, () => {
            return ext.api.status;
        });
        this._messenger.onRequest(GetCurrentOrgRequest, () => {
            return ext.api.selectedOrg;
        });
        this._messenger.onRequest(GetAllOrgsRequest, async () => {
            const loginSuccess = await ext.api.waitForLogin();
            if (loginSuccess) {
                const userInfo = await orgClient.getUserInfo();
                return userInfo.organizations;
            }
        });
        // TODO: Remove this once the Choreo project client RPC handlers are registered
        this._messenger.onRequest(GetAllProjectsRequest, async () => {
            if (ext.api.selectedOrg) {
                return projectClient.getProjects(ext.api.selectedOrg.id);
            }
        });
        ext.api.onStatusChanged((newStatus) => {
            this._messenger.sendNotification(LoginStatusChangedNotification, BROADCAST, newStatus);
        });
        ext.api.onOrganizationChanged((newOrg) => {
            this._messenger.sendNotification(SelectedOrgChangedNotification, BROADCAST, newOrg);
        });
        ext.api.onChoreoProjectChanged((newProject) => {
            //this._messenger.sendNotification(SelectedProjectChangedNotification, BROADCAST, newProject);
        });
        this._messenger.onNotification(ExecuteCommandNotification, (args: string[]) => {
            if (args.length >= 1) {
                const cmdArgs = args.length > 1 ? args.slice(1) : [];
                commands.executeCommand(args[0], ...cmdArgs);
            }
        });

        // Register RPC handlers for Choreo project client
        registerChoreoProjectRPCHandlers(this._messenger, projectClient);
    }
}
