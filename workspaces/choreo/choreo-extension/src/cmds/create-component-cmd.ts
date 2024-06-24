/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ExtensionContext, ProgressLocation, Uri, WorkspaceFolder, commands, window, workspace } from "vscode";
import { ext } from "../extensionVariables";
import {
    ChoreoComponentType,
    CommandIds,
    EndpointYamlContent,
    ICreateComponentParams,
    Project,
    SubmitComponentCreateReq,
    WorkspaceConfig,
} from "@wso2-enterprise/choreo-core";
import { ComponentFormView } from "../views/webviews/ComponentFormView";
import { getUserInfoForCmd, selectOrg, selectProjectWithCreateNew } from "./cmd-utils";
import * as path from "path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { getSubPath, makeURLSafe } from "../utils";
import * as yaml from "js-yaml";
import { showComponentDetailsView } from "../views/webviews/ComponentDetailsView";
import { contextStore } from "../stores/context-store";
import { dataCacheStore } from "../stores/data-cache-store";
import * as os from "os";
import { updateContextFile } from "./set-directory-context-cmd";
import { authStore } from "../stores/auth-store";
import { getGitRoot } from "../git/util";

let componentWizard: ComponentFormView;

export function createNewComponentCommand(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand(CommandIds.CreateNewComponent, async (params: ICreateComponentParams) => {
            try {
                const userInfo = await getUserInfoForCmd("create a component");
                if (userInfo) {
                    const selected = contextStore.getState().state.selected;
                    let selectedProject = selected?.project;
                    let selectedOrg = selected?.org;

                    if (!selectedProject || !selectedOrg) {
                        selectedOrg = await selectOrg(userInfo, "Select organization");

                        const createdProjectRes = await selectProjectWithCreateNew(
                            selectedOrg,
                            `Loading projects from '${selectedOrg.name}'`,
                            `Select the project from '${selectedOrg.name}', to create the component in`
                        );
                        selectedProject = createdProjectRes.selectedProject;
                    }

                    let subPath: string | null = null;

                    if (params?.initialValues?.componentDir) {
                        const workspaceDir = workspace.workspaceFolders?.find(
                            (item) => !!getSubPath(params?.initialValues?.componentDir!, item.uri.path)
                        );
                        if (workspaceDir) {
                            subPath = getSubPath(params?.initialValues?.componentDir!, workspaceDir?.uri.path);
                        }
                    }

                    if (componentWizard) {
                        componentWizard.dispose();
                    }

                    let dirName = "",
                        dirPath = "",
                        dirFsPath = "";
                    if (workspace.workspaceFile && workspace.workspaceFile.scheme !== "untitled") {
                        dirFsPath = path.dirname(workspace.workspaceFile.fsPath);
                        dirPath = path.dirname(workspace.workspaceFile.path);
                        dirName = path.basename(path.dirname(workspace.workspaceFile.path));
                    } else if (workspace.workspaceFolders && workspace.workspaceFolders?.length > 0) {
                        if (workspace.workspaceFolders?.length === 1) {
                            const firstFolder = workspace.workspaceFolders[0];
                            dirFsPath = firstFolder.uri.fsPath;
                            dirPath = firstFolder.uri.path;
                            dirName = firstFolder.name;
                        } else {
                            dirFsPath = Uri.file(os.homedir()).fsPath;
                            dirPath = Uri.file(os.homedir()).path;
                        }
                    } else {
                        dirFsPath = Uri.file(os.homedir()).fsPath;
                        dirPath = Uri.file(os.homedir()).path;
                    }

                    componentWizard = new ComponentFormView(ext.context.extensionUri, {
                        directoryPath: dirPath,
                        directoryFsPath: dirFsPath,
                        directoryName: dirName,
                        organization: selectedOrg!,
                        project: selectedProject!,
                        initialValues: {
                            type: params?.initialValues?.type,
                            buildPackLang: params?.initialValues?.buildPackLang,
                            subPath: subPath || "",
                        },
                    });
                    componentWizard.getWebview()?.reveal();
                }
            } catch (err: any) {
                console.error("Failed to create component", err);
                window.showErrorMessage(err?.message || "Failed to create component");
            }
        })
    );
}

export const submitCreateComponentHandler = async ({
    createParams,
    endpoint,
    org,
    project,
}: SubmitComponentCreateReq) => {
    const cleanCompName = makeURLSafe(createParams.name);
    await window.withProgress(
        {
            title: `Creating new component ${createParams.displayName}...`,
            location: ProgressLocation.Notification,
        },
        () => ext.clients.rpcClient.createComponent(createParams)
    );

    if (createParams.type === ChoreoComponentType.Service && endpoint) {
        const endpointFileContent: EndpointYamlContent = {
            version: "0.1",
            endpoints: [{ name: cleanCompName, context: "/", type: "REST", ...endpoint }],
        };
        const choreoDir = path.join(createParams.componentDir, ".choreo");
        if (!existsSync(choreoDir)) {
            mkdirSync(choreoDir);
        }
        writeFileSync(path.join(choreoDir, "endpoints.yaml"), yaml.dump(endpointFileContent));
    }

    window.showInformationMessage(`Component ${createParams?.name} has been successfully created`);

    const createdComponent = await window.withProgress(
        {
            title: `Fetching newly created component ${createParams?.name}...`,
            location: ProgressLocation.Notification,
        },
        () =>
            ext.clients.rpcClient.getComponentItem({
                orgId: org.id.toString(),
                projectHandle: project.handler,
                componentName: cleanCompName,
            })
    );

    if (createdComponent) {
        showComponentDetailsView(org, project, createdComponent, createParams?.componentDir);

        const compCache = dataCacheStore.getState().getComponents(org.handle, project.handler);
        dataCacheStore.getState().setComponents(org.handle, project.handler, [...compCache, createdComponent]);

        // update the context file if needed
        try {
            const gitRoot = await getGitRoot(ext.context, createParams.componentDir);
            const projectCache = dataCacheStore.getState().getProjects(org.handle);
            if (gitRoot) {
                updateContextFile(gitRoot, authStore.getState().state.userInfo!, project, org, projectCache);
            }
        } catch (err) {
            console.error("Failed to get git details of ", createParams.componentDir);
        }

        if (
            workspace.workspaceFile &&
            workspace.workspaceFile.scheme !== "untitled" &&
            path.basename(workspace.workspaceFile.path) === `${project?.handler}.code-workspace`
        ) {
            workspace.updateWorkspaceFolders(workspace.workspaceFolders?.length!, null, {
                name: createdComponent.metadata.name,
                uri: Uri.parse(createParams.componentDir),
            });
        } else {
            // show n
        }

        if (workspace.workspaceFile) {
            if (
                workspace.workspaceFile.scheme !== "untitled" &&
                path.basename(workspace.workspaceFile.path) === `${project?.handler}.code-workspace`
            ) {
                // Automatically update the workspace if user is within a project workspace
                workspace.updateWorkspaceFolders(workspace.workspaceFolders?.length!, null, {
                    name: createdComponent.metadata.name,
                    uri: Uri.parse(createParams.componentDir),
                });
            } else {
                // Else manfully ask and update the workspace
                window
                    .showInformationMessage(
                        `Do you want update your workspace with the directory of ${createdComponent.metadata.name}`,
                        "Continue"
                    )
                    .then((resp) => {
                        if (resp === "Continue") {
                            workspace.updateWorkspaceFolders(workspace.workspaceFolders?.length!, null, {
                                name: createdComponent.metadata.name,
                                uri: Uri.parse(createParams.componentDir),
                            });
                        }
                    });
            }
        }

        contextStore.getState().refreshState();
    }

    return createdComponent;
};
