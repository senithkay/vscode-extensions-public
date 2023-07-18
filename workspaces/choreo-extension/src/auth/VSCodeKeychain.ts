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

export class VSCodeKeychain {
	constructor(
		private readonly context: vscode.ExtensionContext,
	) {}

	async setToken(serviceId: string, token: string): Promise<void> {
		try {
			return await this.context.secrets.store(serviceId, token);
		} catch (e) {
			// Ignore
			getLogger().error(`Setting token failed: ${e}`);
		}
	}

	async getToken(serviceId: string): Promise<string | null | undefined> {
		try {
			const secret = await this.context.secrets.get(serviceId);
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

	async deleteToken(serviceId: string): Promise<void> {
		try {
			return await this.context.secrets.delete(serviceId);
		} catch (e) {
			// Ignore
			getLogger().error(`Deleting token failed: ${e}`);
			return Promise.resolve(undefined);
		}
	}
}
