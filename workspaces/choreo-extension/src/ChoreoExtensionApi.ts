import { ChoreoLoginStatus } from "./auth/events";

/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */
import { Disposable, EventEmitter } from 'vscode';
import { ext } from "./extensionVariables";

import { Organization } from "./api/types";
import { exchangeAuthToken } from "./auth/inbuilt-impl";

export interface IChoreoExtensionAPI {
    signIn(authCode: string): Promise<void>;
    waitForLogin(): Promise<boolean>;
}

export class ChoreoExtensionApi {
    public userName: string | undefined;

    private _status: ChoreoLoginStatus;
    private _selectedOrg: Organization | undefined;

    private _onStatusChanged = new EventEmitter<ChoreoLoginStatus>();
    public onStatusChanged = this._onStatusChanged.event;


	private _onOrganizationChanged = new EventEmitter<Organization | undefined>();
    public onOrganizationChanged = this._onOrganizationChanged.event;

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

}