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
import { ProgressLocation, commands, window } from "vscode";
import { choreoEnvConfig, initiateInbuiltAuth as openAuthURL } from "./auth";
import { ext } from '../extensionVariables';
import { STATUS_INITIALIZING, STATUS_LOGGED_OUT, STATUS_LOGGING_IN, choreoSignInCmdId, choreoSignInWithAuthCodeCmdId, choreoSignOutCmdId, openWalkthroughCmdId } from '../constants';
import { getLogger } from '../logger/logger';
import { sendTelemetryEvent } from '../telemetry/utils';
import { SIGN_IN_CANCEL_EVENT, SIGN_IN_FAILURE_EVENT, SIGN_IN_FROM_EXISITING_SESSION_FAILURE_EVENT, SIGN_IN_FROM_EXISITING_SESSION_START_EVENT, SIGN_IN_FROM_EXISITING_SESSION_SUCCESS_EVENT, SIGN_IN_START_EVENT, SIGN_OUT_FAILURE_EVENT, SIGN_OUT_START_EVENT, SIGN_OUT_SUCCESS_EVENT } from '@wso2-enterprise/choreo-core';
import * as vscode from 'vscode';
import { AuthHandler } from "./AuthHandler";

export async function activateAuth(context: vscode.ExtensionContext) {
    ext.api.status = STATUS_INITIALIZING;
    ext.authHandler = new AuthHandler(context, choreoEnvConfig);
    await initFromExistingChoreoSession();

    commands.registerCommand(choreoSignInCmdId, async () => {
        try {
            getLogger().debug("Signing in to Choreo");
            sendTelemetryEvent(SIGN_IN_START_EVENT);
            ext.api.status = STATUS_LOGGING_IN;
            const openSuccess = await openAuthURL();
            if (openSuccess) {
                await window.withProgress({
                    title: 'Signing in to Choreo',
                    location: ProgressLocation.Notification,
                    cancellable: true
                }, async (_progress, cancellationToken) => {
                    cancellationToken.onCancellationRequested(async () => {
                        getLogger().warn("Signing in to Choreo cancelled");
                        sendTelemetryEvent(SIGN_IN_CANCEL_EVENT);
                        ext.authHandler.signout();
                    });
                    await ext.api.waitForLogin();
                });
            } else {
                getLogger().error("Unable to open external link for authentication.");
                ext.authHandler.signout();
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
            ext.authHandler.signout();
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
            ext.api.status = STATUS_LOGGING_IN;

            const authCode = await vscode.window.showInputBox({
                prompt: 'Enter Authentication Code: ',
                placeHolder: 'Code',
                ignoreFocusOut: true,
            });

            if (authCode) {
                ext.api.signInWithAuthCode(authCode);
            } else {
                window.showErrorMessage("Auth Code is required to login");
            }
        } catch (error: any) {
            ext.api.status = STATUS_LOGGED_OUT;
            getLogger().error("Error while signing in using Auth Code." + error?.message + (error?.cause ? "\nCause: " + error.cause.message : ""));
            if (error instanceof Error) {
                window.showErrorMessage(error.message);
            }
        }
    });

    vscode.commands.registerCommand(openWalkthroughCmdId, () => {
        vscode.commands.executeCommand(`workbench.action.openWalkthrough`, `wso2.choreo#choreo.getStarted`, false);
    })
}

async function initFromExistingChoreoSession() {
    getLogger().debug("Initializing from existing Choreo session");
    try {
        await ext.authHandler.signin(true);
    } catch (error: any) {
        getLogger().error("Error while initializing from existing Choreo session. " + error?.message);
        ext.authHandler.signout();
    }
}
