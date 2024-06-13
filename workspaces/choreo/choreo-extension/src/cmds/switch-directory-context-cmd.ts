/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ExtensionContext, window, commands, QuickPickItem, QuickPickItemKind } from "vscode";
import { CommandIds } from "@wso2-enterprise/choreo-core";
import { getUserInfoForCmd } from "./cmd-utils";
import { contextStore } from "../stores/context-store";

export function switchDirectoryContextCommand(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand(CommandIds.SwitchDirectoryContext, async () => {
            try {
                const userInfo = await getUserInfoForCmd("switch directory context");
                if (userInfo) {
                    const contextItems = Object.values(contextStore.getState().state.items).filter(
                        (item) => item.project && item.org
                    );

                    if (contextItems.length === 0) {
                        commands.executeCommand(CommandIds.SetDirectoryContext);
                    } else {
                        const selected = contextStore.getState().state?.selected;
                        const unSelectedItems = contextItems.filter(
                            (item) => item.project?.id !== selected?.project?.id
                        );
                        const quickPickOptions: QuickPickItem[] = [
                            { kind: QuickPickItemKind.Separator, label: "Selected Project" },
                            { label: selected?.project?.name!, detail: selected?.org?.name, picked: true },
                            { kind: QuickPickItemKind.Separator, label: "Available Projects" },
                            ...unSelectedItems.map((item) => ({
                                label: item.project?.name!,
                                detail: item.org?.name,
                                item,
                            })),
                            { kind: QuickPickItemKind.Separator, label: "Other options" },
                            {
                                label: "Create a new link",
                                detail: `Associate your workspace with a different Choreo project`,
                                alwaysShow: true,
                            },
                        ];

                        const selection = await window.showQuickPick(quickPickOptions, {
                            title: "Select Project",
                        });
                        if (selection?.label === "Create a new link") {
                            commands.executeCommand(CommandIds.SetDirectoryContext);
                        } else if ((selection as any)?.item) {
                            contextStore.getState().changeContext((selection as any)?.item);
                        }
                    }
                }
            } catch (err: any) {
                console.error("Failed to switch project context", err);
                window.showErrorMessage(`Failed to switch project context. ${err?.message}`);
            }
        })
    );
}
