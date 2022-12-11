/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import * as vscode from 'vscode';
import { commands, window } from "vscode";
import { ChoreoToken, exchangeAuthToken, exchangeRefreshToken, initiateInbuiltAuth as openAuthURL, signIn, signOut } from "./inbuilt-impl";
import { ChoreoAuthConfig, ChoreoFidp } from "./config";
import { URLSearchParams } from 'url';
import { ext } from '../extensionVariables';
import { choreoSignInCmdId, choreoSignOutCmdId } from '../constants';
import { getChoreoToken } from './storage';

export let choreoAuthConfig: ChoreoAuthConfig;
export async function activateAuth() {
    choreoAuthConfig = new ChoreoAuthConfig();
    await initFromExistingChoreoSession();
    vscode.window.registerUriHandler({
        handleUri(uri: vscode.Uri): vscode.ProviderResult<void> {
            if (uri.path === '/choreo-signin') {
                ext.api.status = "LoggingIn";
                const urlParams = new URLSearchParams(uri.query);
                const authCode = urlParams.get('code');
                if (authCode) {
                    exchangeAuthToken(authCode);
                } else {
                    vscode.window.showErrorMessage(`Choreo Login Failed: Authorization code not found!`);
                }
            }
        }
    });

    commands.registerCommand(choreoSignInCmdId, async () => {
        try {
            ext.api.status = "LoggingIn";
            choreoAuthConfig.setFidp(ChoreoFidp.google);
            const openSuccess = await openAuthURL();
            if (openSuccess) {
                await window.withProgress({
                    title: 'Signing in to Choreo',
                    location: vscode.ProgressLocation.Notification,
                    cancellable: true
                }, async (_progress, cancellationToken) => {
                    cancellationToken.onCancellationRequested(async () => {
                        await signOut();
                    });
                    await ext.api.waitForLogin();
                });
            } else {
                await signOut();
                window.showErrorMessage("Unable to open external link for authentication.");
            }
        } catch (error) {
            if (error instanceof Error) {
                window.showErrorMessage(error.message);
            }
        }
    });

    commands.registerCommand(choreoSignOutCmdId, async () => {
        try {
            await signOut();
            window.showInformationMessage('Successfully signed out from Choreo!');
        } catch (error) {
            if (error instanceof Error) {
                window.showErrorMessage(error.message);
            }
        }
    });
}

async function initFromExistingChoreoSession() {
    const choreoTokenInfo = await getChoreoToken(ChoreoToken);
    if (choreoTokenInfo?.accessToken && choreoTokenInfo.expirationTime
        && choreoTokenInfo.loginTime && choreoTokenInfo.refreshToken) {
        await signIn();
    } else {
        await signOut();
    }
}