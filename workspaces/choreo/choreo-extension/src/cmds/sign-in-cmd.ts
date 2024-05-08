/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ProgressLocation, ExtensionContext, commands, window } from "vscode";
import { ext } from "../extensionVariables";
import { authStore } from "../stores/auth-store";
import { getLogger } from "../logger/logger";
import { sendTelemetryEvent } from "../telemetry/utils";
import {
    CommandIds,
    SIGN_IN_FAILURE_EVENT,
    SIGN_IN_START_EVENT,
} from "@wso2-enterprise/choreo-core";
import * as vscode from "vscode";

export function signInCommand(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand(CommandIds.SignIn, async () => {
            try {
                getLogger().debug("Signing in to Choreo");
                sendTelemetryEvent(SIGN_IN_START_EVENT);
                const callbackUrl = await vscode.env.asExternalUri(
                    vscode.Uri.parse(`${vscode.env.uriScheme}://wso2.choreo/signin`)
                );

                const loginUrl = await window.withProgress(
                    { title: `Generating Login URL...`, location: ProgressLocation.Notification },
                    () => ext.clients.rpcClient.getSignInUrl(callbackUrl.toString())
                );

                if (loginUrl) {
                    await vscode.env.openExternal(vscode.Uri.parse(loginUrl));
                } else {
                    getLogger().error("Unable to open external link for authentication.");
                    window.showErrorMessage("Unable to open external link for authentication.");
                }
            } catch (error: any) {
                sendTelemetryEvent(SIGN_IN_FAILURE_EVENT, { cause: error?.message });
                getLogger().error(
                    "Error while signing in to Choreo. " +
                        error?.message +
                        (error?.cause ? "\nCause: " + error.cause.message : "")
                );
                if (error instanceof Error) {
                    window.showErrorMessage(error.message);
                }
            }
        })
    );
}
