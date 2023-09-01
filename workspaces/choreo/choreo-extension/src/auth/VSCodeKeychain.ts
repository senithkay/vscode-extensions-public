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
import * as vscode from 'vscode';
import { getLogger } from '../logger/logger';
import { UserInfo } from '@wso2-enterprise/choreo-core';

const CHOREO_USER_KEY = 'choreo.user';
export class VSCodeKeychain {

    private _onUserInfoChange = new vscode.EventEmitter<UserInfo|undefined>();

	public readonly onUserInfoChange = this._onUserInfoChange.event;

	constructor(
		private readonly context: vscode.ExtensionContext,
	) {
		context.secrets.onDidChange(async (event) => {
			if (event.key === CHOREO_USER_KEY) {		
				this._onUserInfoChange.fire(await this.getCurrentUser());
			}
		});
	}

	async setToken(key: string, token: string): Promise<void> {
		try {
			return await this.context.secrets.store(key, token);
		} catch (e) {
			// Ignore
			getLogger().error(`Setting token failed: ${e}`);
		}
	}

	async getToken(key: string): Promise<string | null | undefined> {
		try {
			const secret = await this.context.secrets.get(key);
			if (secret && secret !== '[]') {
				getLogger().trace('Token acquired from secret storage.');
			}
			return secret;
		} catch (e) {
			// Ignore
			getLogger().error(`Getting token failed: ${e}`);
			return Promise.resolve(undefined);
		}
	}

	async deleteToken(key: string): Promise<void> {
		try {
			return await this.context.secrets.delete(key);
		} catch (e) {
			// Ignore
			getLogger().error(`Deleting token failed: ${e}`);
			return Promise.resolve(undefined);
		}
	}

	async deleteCurrentUser(): Promise<void> {
		try {
			return await this.context.secrets.delete(CHOREO_USER_KEY);
		} catch (e) {
			// Ignore
			getLogger().error(`Deleting current user info failed: ${e}`);
			return Promise.resolve(undefined);
		}
	}

	async setCurrentUser(user: UserInfo): Promise<void> {
		try {
			return await this.context.secrets.store(CHOREO_USER_KEY, JSON.stringify(user));
		} catch (e) {
			// Ignore
			getLogger().error(`Setting current user info failed: ${e}`);
			return Promise.resolve(undefined);
		}
	}

	async getCurrentUser(): Promise<UserInfo | undefined> {
		try {
			const userInfo = await this.context.secrets.get(CHOREO_USER_KEY);
			if (userInfo && userInfo !== '[]') {
				getLogger().trace('User info acquired from secret storage.');
				return JSON.parse(userInfo);
			}
		} catch (e) {
			// Ignore
			getLogger().error(`Getting current user info failed: ${e}`);
		}
		return Promise.resolve(undefined);
	}
}
