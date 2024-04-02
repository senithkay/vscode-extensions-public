/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ProgressLocation, QuickPickItem, QuickPickOptions, commands, window } from "vscode";
import { choreoEnvConfig } from "./auth";
import { ext } from '../extensionVariables';
import { choreoSignInCmdId, choreoSignInWithAuthCodeCmdId, choreoSignOutCmdId, openWalkthroughCmdId } from '../constants';
import { getLogger } from '../logger/logger';
import { sendTelemetryEvent } from '../telemetry/utils';
import { CHANGE_ORG_EVENT, CHANGE_ORG_EVENT_FAILURE, SIGN_IN_CANCEL_EVENT, SIGN_IN_FAILURE_EVENT, SIGN_IN_FROM_EXISITING_SESSION_FAILURE_EVENT, SIGN_IN_FROM_EXISITING_SESSION_START_EVENT, SIGN_IN_FROM_EXISITING_SESSION_SUCCESS_EVENT, SIGN_IN_START_EVENT, SIGN_OUT_FAILURE_EVENT, SIGN_OUT_START_EVENT, SIGN_OUT_SUCCESS_EVENT } from '@wso2-enterprise/choreo-core';
import * as vscode from 'vscode';
import { authStore } from "../states/authState";

export async function activateAuth(context: vscode.ExtensionContext) {
    await initFromExistingChoreoSession();

    commands.registerCommand(choreoSignInCmdId, async () => {
        try {
            getLogger().debug("Signing in to Choreo");
            sendTelemetryEvent(SIGN_IN_START_EVENT);
            const callbackUrl = await vscode.env.asExternalUri(
                vscode.Uri.parse(`${vscode.env.uriScheme}://wso2.choreo/signin`)
            );

            const loginUrl = await ext.clients.rpcClient.getSignInUrl(callbackUrl.toString());

            if (loginUrl) {
                const opened = await vscode.env.openExternal(vscode.Uri.parse(loginUrl));
                if (opened){
                    await window.withProgress({
                        title: 'Signing in to Choreo',
                        location: ProgressLocation.Notification,
                        cancellable: true
                    }, async (_progress, cancellationToken) => {
                        cancellationToken.onCancellationRequested(async () => {
                            getLogger().warn("Signing in to Choreo cancelled");
                            sendTelemetryEvent(SIGN_IN_CANCEL_EVENT);
                            // ext.authHandler.signout();
                            authStore.getState().logout();
                        });
                        // await ext.api.waitForLogin();// todo: remove
                        authStore.getState().loginStart();
                    });
                }
            } else {
                getLogger().error("Unable to open external link for authentication.");
                // ext.authHandler.signout();
                authStore.getState().logout();
                window.showErrorMessage("Unable to open external link for authentication.");
            }
        } catch (error: any) {
            sendTelemetryEvent(SIGN_IN_FAILURE_EVENT, { cause: error?.message });
            getLogger().error("Error while signing in to Choreo. " + error?.message + (error?.cause ? "\nCause: " + error.cause.message : ""));
            if (error instanceof Error) {
                window.showErrorMessage(error.message);
            }
        }
    });

    commands.registerCommand(choreoSignOutCmdId, async () => {
        try {
            getLogger().debug("Signing out from Choreo");
            sendTelemetryEvent(SIGN_OUT_START_EVENT);
            await ext.clients.rpcClient.signOut();
            authStore.getState().logout();
            sendTelemetryEvent(SIGN_OUT_SUCCESS_EVENT);
            window.showInformationMessage('Successfully signed out from Choreo!');
        } catch (error: any) {
            sendTelemetryEvent(SIGN_OUT_FAILURE_EVENT, { cause: error?.message });
            getLogger().error("Error while signing out from Choreo. " + error?.message + (error?.cause ? "\nCause: " + error.cause.message : ""));
            if (error instanceof Error) {
                window.showErrorMessage(error.message);
            }
        }
    });

    commands.registerCommand(choreoSignInWithAuthCodeCmdId, async () => {
        try {
            // This is used in the extension test runner to sign into choreo
            getLogger().debug("Signing in to Choreo using code");

            const authCode = await vscode.window.showInputBox({
                prompt: 'Enter Authentication Code: ',
                placeHolder: 'Code',
                ignoreFocusOut: true,
            });

         

            if (authCode) {
                ext.clients.rpcClient.signInWithAuthCode(authCode).then(userInfo=>{
                    if(userInfo){
                        authStore.getState().loginSuccess(userInfo);
                    }
                });  
            } else {
                window.showErrorMessage("Auth Code is required to login");
            }
        } catch (error: any) {
            getLogger().error("Error while signing in using Auth Code." + error?.message + (error?.cause ? "\nCause: " + error.cause.message : ""));
            if (error instanceof Error) {
                window.showErrorMessage(error.message);
            }
        }
    });

    vscode.commands.registerCommand(openWalkthroughCmdId, () => {
        vscode.commands.executeCommand(`workbench.action.openWalkthrough`, `wso2.choreo#choreo.getStarted`, false);
    });
}

// todo: move into auth store
async function initFromExistingChoreoSession() {
    getLogger().debug("Initializing from existing Choreo session");
    sendTelemetryEvent(SIGN_IN_FROM_EXISITING_SESSION_START_EVENT);
    try {
        const userInfo = await ext.clients.rpcClient.getUserInfo();
        if(userInfo){
            authStore.getState().loginSuccess(userInfo);
            sendTelemetryEvent(SIGN_IN_FROM_EXISITING_SESSION_SUCCESS_EVENT);
        }else{
            authStore.getState().logout();
        }
    } catch (error: any) {
        sendTelemetryEvent(SIGN_IN_FROM_EXISITING_SESSION_FAILURE_EVENT, { cause: error?.message });
        getLogger().error("Error while initializing from existing Choreo session. " + error?.message);
        authStore.getState().logout();
    }
}
