/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ExtensionContext, QuickPickItem, QuickPickItemKind, commands, window } from "vscode";
import {
    CommandIds,
    ComponentKind,
    Organization,
    Project,
    ViewComponentDetailsReq,
} from "@wso2-enterprise/choreo-core";
import { getUserInfoForCmd, selectComponent, selectOrg, selectProject } from "./cmd-utils";
import { existsSync } from "fs";
import * as path from "path";
import { showComponentDetailsView } from "../views/webviews/ComponentDetailsView";
import { contextStore } from "../stores/context-store";
import { authStore } from "../stores/auth-store";
import { choreoEnvConfig } from "../config";

export function manageAccountCommand(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand(CommandIds.ManageAccount, async () => {
            try {
                let userInfo = authStore.getState().state.userInfo;
                const selected = contextStore.getState().state?.selected;
                if (!userInfo) {
                    throw new Error("User is not logged in");
                }

                const quickPickOptions: QuickPickItem[] = [
                    {
                        kind: QuickPickItemKind.Separator,
                        label: `Email: ${userInfo.userEmail}`,
                    },
                    { label: "Manage Billing", detail: "Open Choreo billing portal in your browser" },
                    { label: "Sign Out", detail: `Sign out of Choreo extension` },
                ];

                const selection = await window.showQuickPick(quickPickOptions, {title: userInfo.displayName});

                if (selection?.label === "Sign Out") {
                    commands.executeCommand(CommandIds.SignOut);
                } else if (selection?.label === "Manage Billing") {
                    commands.executeCommand(
                        "vscode.open",
                        `${choreoEnvConfig.getBillingUrl()}/cloud/choreo/upgrade${
                            selected?.org ? `?orgId=${selected.org.uuid}` : ""
                        }`
                    );
                }
            } catch (err: any) {
                console.error("Failed to run manage account command", err);
                window.showErrorMessage(err?.message || "Failed to run manage account command");
            }
        })
    );
}
