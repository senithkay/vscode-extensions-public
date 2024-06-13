/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ExtensionContext, window, commands } from "vscode";
import { CommandIds, ContextItem } from "@wso2-enterprise/choreo-core";
import * as path from "path";
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "fs";
import {
    selectOrg,
    resolveWorkspaceDirectory,
    getUserInfoForCmd,
    selectProjectWithCreateNew,
} from "./cmd-utils";
import { getGitRoot, getGitRemotes } from "../git/util";
import * as yaml from "js-yaml";
import { contextStore } from "../stores/context-store";

export function setDirectoryContextCommand(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand(CommandIds.SetDirectoryContext, async () => {
            try {
                const userInfo = await getUserInfoForCmd("link a directory with a Choreo project");
                if (userInfo) {
                    const directory = await resolveWorkspaceDirectory();
                    let directoryUrl = directory.uri;

                    let gitRoot: string | void = "";
                    try {
                        gitRoot = await getGitRoot(context, directory.uri.fsPath);
                    } catch {
                        // ignore error
                    }

                    if (!gitRoot) {
                        // currently opened directory does not contain any Git remotes

                        const componentDir = await window.showOpenDialog({
                            canSelectFolders: true,
                            canSelectFiles: false,
                            canSelectMany: false,
                            title: "Select directory that needs to be linked with Choreo",
                            defaultUri: directory.uri,
                        });

                        if (componentDir === undefined || componentDir.length === 0) {
                            throw new Error("Directory is required to link with Choreo");
                        }

                        if (!componentDir[0].fsPath.startsWith(directory.uri.fsPath)) {
                            throw new Error("Directory must be within the selected workspace");
                        }

                        directoryUrl = componentDir[0];

                        gitRoot = await getGitRoot(context, componentDir[0].fsPath);
                        if (!gitRoot) {
                            throw new Error("Selected directory is not within a git repository");
                        }
                    }

                    const remotes = await getGitRemotes(context, gitRoot);
                    if (remotes.length === 0) {
                        throw new Error(`The directory does not any Git remotes`);
                    }

                    const selectedOrg = await selectOrg(userInfo, "Select organization");

                    const { projectList, selectedProject } = await selectProjectWithCreateNew(
                        selectedOrg,
                        `Loading projects from '${selectedOrg.name}'`,
                        `Select project from '${selectedOrg.name}'`
                    );

                    const contextFilePath = path.join(gitRoot, ".choreo", "context.yaml");
                    if (existsSync(contextFilePath)) {
                        let parsedData: ContextItem[] = yaml.load(readFileSync(contextFilePath, "utf8")) as any;
                        if (!Array.isArray(parsedData) && (parsedData as any).org && (parsedData as any).project) {
                            parsedData = [{ org: (parsedData as any).org, project: (parsedData as any).project }];
                        }

                        const newList = parsedData.filter(
                            (item) =>
                                userInfo.organizations.some((org) => org.handle === item.org) ||
                                (item.org === selectedOrg.handle &&
                                    projectList.some((project) => project.handler === item.project))
                        );
                        if (
                            !newList.some(
                                (item) => item.org === selectedOrg.handle && item.project === selectedProject.handler
                            )
                        ) {
                            newList.push({ org: selectedOrg.handle, project: selectedProject.handler });
                        }
                        writeFileSync(contextFilePath, yaml.dump(newList));
                    } else {
                        const choreoDir = path.join(gitRoot, ".choreo");
                        if (!existsSync(choreoDir)) {
                            mkdirSync(choreoDir);
                        }
                        let contextYamlData: ContextItem[] = [
                            { org: selectedOrg.handle, project: selectedProject.handler },
                        ];
                        writeFileSync(path.join(choreoDir, "context.yaml"), yaml.dump(contextYamlData));
                    }

                    contextStore
                        .getState()
                        .onSetNewContext(
                            selectedOrg,
                            selectedProject,
                            {
                                contextFileFsPath: contextFilePath,
                                dirFsPath: directoryUrl.fsPath,
                                workspaceName: directory.name,
                                projectRootFsPath: path.dirname(path.dirname(contextFilePath))
                                
                            }
                        );
                }
            } catch (err: any) {
                console.error("Failed to link project", err);
                window.showErrorMessage(`Failed to link project. ${err?.message}`);
            }
        })
    );
}
