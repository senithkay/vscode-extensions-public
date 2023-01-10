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
import { Disposable, EventEmitter } from 'vscode';
import { ext } from "./extensionVariables";

import { IProjectManager, Organization, Project, ChoreoLoginStatus } from "@wso2-enterprise/choreo-core";
import { exchangeAuthToken } from "./auth/auth";

export interface IChoreoExtensionAPI {
    signIn(authCode: string): Promise<void>;
    waitForLogin(): Promise<boolean>;
}

export class ChoreoExtensionApi {
    // TODO move this to ext namespace
    public userName: string | undefined;

    private _status: ChoreoLoginStatus;
    private _selectedOrg: Organization | undefined;

    private _onStatusChanged = new EventEmitter<ChoreoLoginStatus>();
    public onStatusChanged = this._onStatusChanged.event;


    private _onOrganizationChanged = new EventEmitter<Organization | undefined>();
    public onOrganizationChanged = this._onOrganizationChanged.event;

    private _onChoreoProjectChanged = new EventEmitter<Project | undefined>();
    public onChoreoProjectChanged = this._onChoreoProjectChanged.event; // TODO implement firing

    constructor() {
        this._status = "Initializing";
    }

    public get status(): ChoreoLoginStatus {
        return this._status;
    }
    public set status(value: ChoreoLoginStatus) {
        this._status = value;
        this._onStatusChanged.fire(value);
    }

    public get selectedOrg(): Organization | undefined {
        return this._selectedOrg;
    }
    public set selectedOrg(selectedOrg: Organization | undefined) {
        this._selectedOrg = selectedOrg;
        this._onOrganizationChanged.fire(selectedOrg);
    }

    public async signIn(authCode: string): Promise<void> {
        return exchangeAuthToken(authCode);
    }

    public async waitForLogin(): Promise<boolean> {
        switch (this._status) {
            case 'LoggedIn':
                return true;
            case 'LoggedOut':
                return false;
            case 'Initializing':
            case 'LoggingIn':
                return new Promise<boolean>(resolve => {
                    const subscription: Disposable = this.onStatusChanged(() => {
                        subscription.dispose();
                        resolve(this.waitForLogin());
                    });
                    ext.context.subscriptions.push(subscription);
                });
            default:
                const status: never = this._status;
                throw new Error(`Unexpected status '${status}'`);
        }
    }

    public isChoreoProject(): Promise<boolean> {
        return Promise.resolve(false);
    }

    public getProjectManager(projectId: string): Promise<IProjectManager | undefined> {
        return Promise.resolve(undefined);
    }

}
