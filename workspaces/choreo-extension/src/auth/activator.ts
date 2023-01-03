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
import { commands, window } from "vscode";
import { ChoreoToken, initiateInbuiltAuth as openAuthURL, signIn, signOut } from "./inbuilt-impl";
import { ChoreoAuthConfig, ChoreoFidp } from "./config";
import { ext } from '../extensionVariables';
import { choreoSignInCmdId, choreoSignOutCmdId } from '../constants';
import { getChoreoToken } from './storage';

export let choreoAuthConfig: ChoreoAuthConfig;
export async function activateAuth() {
    choreoAuthConfig = new ChoreoAuthConfig();
    await initFromExistingChoreoSession();

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