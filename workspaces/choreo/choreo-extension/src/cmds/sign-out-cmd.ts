/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import {  ExtensionContext, commands, window } from "vscode";
import { ext } from "../extensionVariables";
import { authStore } from "../stores/auth-store";
import { getLogger } from "../logger/logger";
import { sendTelemetryEvent } from '../telemetry/utils';
import { CommandIds, SIGN_OUT_START_EVENT, SIGN_OUT_SUCCESS_EVENT, SIGN_OUT_FAILURE_EVENT} from '@wso2-enterprise/choreo-core';

export function signOutCommand(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand(CommandIds.SignOut, async () => {
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
        })
    );
}
