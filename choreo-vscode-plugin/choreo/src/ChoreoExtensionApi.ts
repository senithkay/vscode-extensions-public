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
import { commands, Disposable, Event, EventEmitter } from 'vscode';
import { ext } from "./extensionVariables";
import { getChoreoToken } from "./auth/storage";
import { ChoreoToken } from "./auth/inbuilt-impl";
import jwtDecode from "jwt-decode";

export class ChoreoExtensionApi {
    public userName: string | undefined;
    public status: ChoreoLoginStatus;
	public onStatusChanged = new EventEmitter<ChoreoLoginStatus>();

    constructor() {
        this.status = "Initializing";
    }

    public async waitForLogin(): Promise<boolean> {
		switch (this.status) {
            case 'LoggedIn':
                return true;
            case 'LoggedOut':
                return false;
            case 'Initializing':
            case 'LoggingIn':
                return new Promise<boolean>(resolve => {
                    const subscription: Disposable = this.onStatusChanged.event(() => {
                        subscription.dispose();
                        resolve(this.waitForLogin());
                    });
                    ext.context.subscriptions.push(subscription);
                });
            default:
                const status: never = this.status;
                throw new Error(`Unexpected status '${status}'`);
        }
	}

}