/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ExtensionContext, window, commands, ProgressLocation } from "vscode";
import { CommandIds } from "@wso2-enterprise/choreo-core";
import * as path from "path";
import * as fs from "fs";
import { getUserInfoForCmd, resolveWorkspaceDirectory, selectOrg } from "./cmd-utils";
import { unlinkSync } from "fs";
import { linkedDirectoryStore } from "../stores/linked-dir-store";

export function unlinkComponentCommand(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand(CommandIds.UnlinkComponent, async (params: { componentPath: string }) => {
            try {
                const userInfo = await getUserInfoForCmd("unlink a directory from Choreo");
                if (userInfo) {
                    let componentPath = params.componentPath;

                    if (!componentPath) {
                        const directory = await resolveWorkspaceDirectory();

                        const componentDir = await window.showOpenDialog({
                            canSelectFolders: true,
                            canSelectFiles: false,
                            canSelectMany: false,
                            title: "Select directory that needs to be linked with a component",
                            defaultUri: directory.uri,
                        });

                        if (componentDir === undefined || componentDir.length === 0) {
                            throw new Error("Component directory is required to link proceed with unlinking");
                        }

                        if (!componentDir[0].fsPath.startsWith(directory.uri.fsPath)) {
                            throw new Error("Component directory must be within your workspace");
                        }

                        componentPath = componentDir[0].fsPath;
                    }

                    const linkFilePath = path.join(componentPath, ".choreo", "link.yaml");
                    if (!fs.existsSync(linkFilePath)) {
                        throw new Error("Selected component directory does not contain any link files");
                    }

                    const response = await window.showInformationMessage(
                        `Are you sure you want to unlink this component directory. This action will delete the file ${linkFilePath}, from the directory`,
                        { modal: true },
                        "Unlink Directory"
                    );
                    if (response === "Unlink Directory") {
                        await window.withProgress(
                            {
                                title: `Unlinking component directory ${componentPath}...`,
                                location: ProgressLocation.Notification,
                            },
                            async () => {
                                unlinkSync(linkFilePath);
                                const choreoDirFiles = fs.readdirSync(path.join(componentPath, ".choreo"));
                                if (choreoDirFiles.length === 0) {
                                    fs.rmdirSync(path.join(componentPath, ".choreo"));
                                }
                                linkedDirectoryStore.getState().refreshState();
                                window.showInformationMessage(
                                    `Directory ${componentPath} has been successfully unlinked`
                                );
                            }
                        );
                    }
                }
            } catch (err: any) {
                console.error("Failed to unlink directory", err);
                window.showErrorMessage(err?.message || "Failed to unlink directory");
            }
        })
    );
}
