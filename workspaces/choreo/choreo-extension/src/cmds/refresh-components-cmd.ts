/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ExtensionContext, commands } from "vscode";
import { CommandIds } from "@wso2-enterprise/choreo-core";
import { authStore } from "../stores/auth-store";
import { linkedDirectoryStore } from "../stores/linked-dir-store";

export function refreshComponentsCommand(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand(CommandIds.RefreshComponent, async () => {
            const userInfo = authStore.getState().state.userInfo;
            if (!userInfo) {
                throw new Error("You are not logged in. Please log in and retry.");
            }

            await linkedDirectoryStore.getState().refreshState();
        })
    );
}