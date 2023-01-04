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
import { RequestType, NotificationType, BROADCAST } from 'vscode-messenger-common';
import { Organization } from "../../../api/types";

import { getUserInfo } from "../../../api/user";
import { ext } from "../../../extensionVariables";

// request types 
const getLoginStatus: RequestType<string, string> = { method: 'getLoginStatus' };
const getCurrentOrg: RequestType<string, Organization> = { method: 'getCurrentOrg' };
const getAllOrgs: RequestType<string, Organization[]> = { method: 'getAllOrgs' };

// notification types
const onLoginStatusChanged: NotificationType<string> = { method: 'loginStatusChanged' };
const onSelectedOrgChanged: NotificationType<Organization> = { method: 'selectedOrgChanged' };
const executeCommand: NotificationType<string[]> = { method: 'executeCommand' };


export class WebViewRpc {

    private _messenger = new Messenger();

    constructor(view: WebviewPanel) {
        this._messenger.registerWebviewPanel(view, { broadcastMethods: [ 'loginStatusChanged', 'selectedOrgChanged' ] });

        this._messenger.onRequest(getLoginStatus, () => {
            return ext.api.status;
        });
        this._messenger.onRequest(getCurrentOrg, () => {
            return ext.api.selectedOrg;
        });
        this._messenger.onRequest(getAllOrgs, async () => {
            const loginSuccess = await ext.api.waitForLogin();
            if (loginSuccess) {
                 const userInfo = await getUserInfo();
                 return userInfo.organizations;
            } 
        });
        ext.api.onStatusChanged((newStatus) => {
            this._messenger.sendNotification(onLoginStatusChanged, BROADCAST, newStatus);
        });
        ext.api.onOrganizationChanged((newOrg) => {
            this._messenger.sendNotification(onSelectedOrgChanged, BROADCAST, newOrg);
        });
        this._messenger.onNotification(executeCommand, (args: string[]) => {
            if (args.length >= 1) {
                const cmdArgs = args.length > 1 ? args.slice(1) : [];
                commands.executeCommand(args[0], ...cmdArgs);
            }
        });
    }
}