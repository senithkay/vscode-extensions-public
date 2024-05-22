/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ExtensionContext, window, commands, ProgressLocation } from "vscode";
import { ext } from "../extensionVariables";
import { CommandIds, ComponentKind, LinkFileContent, Organization, Project } from "@wso2-enterprise/choreo-core";
import * as path from "path";
import * as fs from "fs";
import { linkedDirectoryStore } from "../stores/linked-dir-store";
import { selectOrg, selectProject, resolveWorkspaceDirectory, resolveQuickPick, getUserInfoForCmd } from "./cmd-utils";
import { getGitRoot, getGitRemotes, isSameRepo } from "../git/util";
import * as yaml from "js-yaml";
import { showComponentDetailsView } from "../views/webviews/ComponentDetailsView";

export function linkExistingComponentCommand(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand(CommandIds.LinkExistingComponent, async () => {
            try {
                const userInfo = await getUserInfoForCmd("link a directory with a Choreo component");
                if (userInfo) {
                    const directory = await resolveWorkspaceDirectory();

                    let gitRoot = await getGitRoot(context, directory.uri.fsPath);

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

                    const selectedProject = await selectProject(
                        selectedOrg,
                        `Loading projects from '${selectedOrg.name}'`,
                        `Select project from '${selectedOrg.name}'`
                    );

                    const components = await window.withProgress(
                        {
                            title: `Fetching components of ${selectedProject.name}...`,
                            location: ProgressLocation.Notification,
                        },
                        () =>
                            ext.clients.rpcClient.getComponentList({
                                orgId: selectedOrg.id.toString(),
                                projectHandle: selectedProject.handler,
                            })
                    );

                    if (components.length === 0) {
                        throw new Error(`No components found to link within ${selectedProject.name}.`);
                    }

                    const { hasLinks, componentMap } = await getComponentMapForLink(
                        selectedOrg,
                        selectedProject,
                        components,
                        remotes.map((item) => item.fetchUrl ?? ""),
                        gitRoot,
                        directory.uri.fsPath
                    );

                    if (componentMap.size === 0) {
                        if (hasLinks) {
                            window.showInformationMessage(
                                `Directory has already been linked successfully with Choreo Project/Component`
                            );
                            return;
                        } else {
                            throw new Error(
                                `The directory does not match with any of the component within the selected project. 
                                Please ensure that the repository associated with your project/component has been added as a Git remote to the directory.`
                            );
                        }
                    }

                    await createComponentLinks(selectedOrg, selectedProject, componentMap);

                    if (componentMap.size === 1) {
                        const linkedComp = Array.from(componentMap.values())[0][0];
                        const linkedCompPath = Array.from(componentMap.keys())[0];
                        showComponentDetailsView(selectedOrg, selectedProject, linkedComp, linkedCompPath);
                        window.showInformationMessage(
                            `Selected directory has been successfully linked with component ${linkedComp?.metadata.displayName}`
                        );
                    } else {
                        // TODO: show project details view as well
                        window.showInformationMessage(
                            `Selected directory has been successfully linked with ${componentMap.size} components from your project`
                        );
                    }
                }
            } catch (err: any) {
                console.error("Failed to link component", err);
                window.showErrorMessage(`Failed to link component. ${err?.message}`);
            } finally {
                linkedDirectoryStore.getState().refreshState();
            }
        })
    );
}

export const createComponentLinks = async (
    org: Organization,
    project: Project,
    componentMap: Map<string, ComponentKind[]>
) => {
    for (const componentPath of componentMap.keys()) {
        const componentEntries = componentMap.get(componentPath) ?? [];
        if (componentEntries.length > 1) {
            const itemSelection = await window.showQuickPick(
                componentEntries.map((item) => ({ item, label: item.metadata.displayName })),
                {
                    title: `Select component to link with directory ${
                        componentEntries[0].spec.source.github?.path ?? ""
                    }`,
                    ignoreFocusOut: true,
                }
            );

            if (itemSelection) {
                componentMap.set(componentPath, [itemSelection.item]);
            } else {
                componentMap.delete(componentPath);
            }
        }
        await ext.clients.rpcClient.createComponentLink({
            componentDir: componentPath,
            componentHandle: componentEntries[0]?.metadata.name!,
            orgHandle: org.handle,
            projectHandle: project.handler,
        });
    }
};

export const getComponentMapForLink = async (
    org: Organization,
    project: Project,
    components: ComponentKind[],
    remotes: string[],
    repoRoot: string,
    directoryFsPath: string
) => {
    const componentMap = new Map<string, ComponentKind[]>();
    let hasLinks = false;

    for (const component of components) {
        if (remotes.some((remoteItem) => isSameRepo(component.spec.source.github?.repository, remoteItem))) {
            // matching git repo
            const compPath = path.join(repoRoot, component.spec.source.github?.path!);
            // check if directory path is exists
            if (fs.existsSync(compPath) && path.normalize(compPath).startsWith(path.normalize(directoryFsPath))) {
                // check if link file already exists
                const linkFilePath = path.join(compPath, ".choreo", "link.yaml");
                let parsedData: LinkFileContent | undefined = undefined;

                try {
                    if (fs.existsSync(linkFilePath)) {
                        parsedData = yaml.load(fs.readFileSync(linkFilePath, "utf8")) as any;
                    }
                } catch {
                    // Do nothing
                }

                if (
                    parsedData?.org === org.handle &&
                    parsedData?.project === project.handler &&
                    components.some((item) => item.metadata.name === parsedData?.component)
                ) {
                    // do nothing, since its a valid link file
                    hasLinks = true;
                } else {
                    componentMap.set(compPath, [...(componentMap.get(compPath) ?? []), component]);
                }
            }
        }
    }

    return { hasLinks, componentMap };
};
