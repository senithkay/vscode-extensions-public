/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ProgressLocation, type ProviderResult, type Uri, window } from "vscode";
import { ResponseError } from "vscode-jsonrpc";
import { ErrorCode } from "./choreo-rpc/constants";
import { ext } from "./extensionVariables";
import { getLogger } from "./logger/logger";
import { authStore } from "./stores/auth-store";

export function activateURIHandlers() {
	window.registerUriHandler({
		handleUri(uri: Uri): ProviderResult<void> {
			getLogger().debug(`Handling URI: ${uri.toString()}`);

			if (uri.path === "/signin") {
				getLogger().info("Choreo Login Callback hit");
				const urlParams = new URLSearchParams(uri.query);
				const authCode = urlParams.get("code");
				if (authCode) {
					getLogger().debug("Initiating Choreo sign in flow from auth code");
					// TODO: Check if status is equal to STATUS_LOGGING_IN, if not, show error message.
					// It means that the login was initiated from somewhere else or an old page was opened/refreshed in the browser
					window.withProgress(
						{
							title: "Verifying user details and logging into Choreo...",
							location: ProgressLocation.Notification,
						},
						async () => {
							try {
								const userInfo = await ext.clients.rpcClient.signInWithAuthCode(authCode);
								if (userInfo) {
									authStore.getState().loginSuccess(userInfo);
								}
							} catch (error: any) {
								if (!(error instanceof ResponseError) || error.code !== ErrorCode.NoOrgsAvailable) {
									window.showErrorMessage("Sign in failed. Please check the logs for more details.");
								}
								getLogger().error(`Choreo sign in Failed: ${error.message}`);
							}
						},
					);
				} else {
					getLogger().error("Choreo Login Failed: Authorization code not found!");
					window.showErrorMessage("Choreo Login Failed: Authorization code not found!");
				}
			} else if (uri.path === "/ghapp") {
				getLogger().info("Choreo Githup auth Callback hit");
				const urlParams = new URLSearchParams(uri.query);
				const authCode = urlParams.get("code");
				// const installationId = urlParams.get("installationId");
				const orgId = urlParams.get("orgId");
				if (authCode && orgId) {
					ext.clients.rpcClient.obtainGithubToken({ code: authCode, orgId });
				}
			}
		},
	});
}
