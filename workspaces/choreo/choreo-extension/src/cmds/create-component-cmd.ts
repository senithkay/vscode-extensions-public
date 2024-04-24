/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ExtensionContext, ProgressLocation, WorkspaceFolder, commands, window, workspace } from "vscode";
import { ext } from "../extensionVariables";
import {
    ChoreoComponentType,
    CommandIds,
    EndpointYamlContent,
    ICreateComponentParams,
    Project,
    SubmitComponentCreateReq,
} from "@wso2-enterprise/choreo-core";
import { ComponentFormView } from "../views/webviews/ComponentFormView";
import { getUserInfoForCmd, resolveWorkspaceDirectory, selectOrg, selectProjectWithCreateNew } from "./cmd-utils";
import * as path from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { linkedDirectoryStore } from "../stores/linked-dir-store";
import { getSubPath, makeURLSafe } from "../utils";
import { showComponentDetails } from "./view-component-cmd";
import * as yaml from "js-yaml";
import { dataCacheStore } from "../stores/data-cache-store";

let componentWizard: ComponentFormView;

export function createNewComponentCommand(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand(CommandIds.CreateNewComponent, async (params: ICreateComponentParams) => {
            try {
                const userInfo = await getUserInfoForCmd("create a component");
                if (userInfo) {
                    let subPath: string | null = null;
                    let workspaceDir: WorkspaceFolder | undefined;

                    if (params?.initialValues?.componentDir) {
                        const workspaceDir = workspace.workspaceFolders?.find(
                            (item) => !!getSubPath(params?.initialValues?.componentDir!, item.uri.path)
                        );
                        if (workspaceDir) {
                            subPath = getSubPath(params?.initialValues?.componentDir!, workspaceDir?.uri.path);
                        }
                    }

                    if (!workspaceDir) {
                        workspaceDir = await resolveWorkspaceDirectory();
                    }

                    const selectedOrg = await selectOrg(userInfo, "Select organization (1/2)");

                    let selectedProject = await selectProjectWithCreateNew(
                        selectedOrg,
                        `Loading projects from '${selectedOrg.name}' (2/2)`,
                        `Select project from '${selectedOrg.name}' to create your component in (2/2)`
                    );

                    if (selectedProject === "new-project") {
                        const projectCache = dataCacheStore.getState().getProjects(selectedOrg.handle);

                        const newProjectName = await window.showInputBox({
                            placeHolder: "project-name",
                            title: "New Project Name",
                            validateInput: (val) =>
                                projectCache?.some((item) => item.name === val) ? "Project name already exists" : null,
                        });

                        if (!newProjectName) {
                            throw new Error("New project name is required to create a component.");
                        }

                        selectedProject = await window.withProgress(
                            { title: `Creating new project ${newProjectName}...`, location: ProgressLocation.Notification },
                            () =>
                                ext.clients.rpcClient.createProject({
                                    orgHandler: selectedOrg.handle,
                                    orgId: selectedOrg.id.toString(),
                                    projectName: newProjectName,
                                    region: "US",
                                })
                        );
                    }

                    if (componentWizard) {
                        componentWizard.dispose();
                    }
                    componentWizard = new ComponentFormView(ext.context.extensionUri, {
                        directoryPath: workspaceDir.uri.path,
                        directoryName: workspaceDir.name,
                        organization: selectedOrg,
                        project: selectedProject as Project,
                        initialValues: {
                            type: params?.initialValues?.type,
                            buildPackLang: params?.initialValues?.buildPackLang,
                            subPath: subPath || ".",
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
            title: `Creating new component ${createParams.name}...`,
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

    await ext.clients.rpcClient.createComponentLink({
        componentDir: createParams.componentDir,
        componentHandle: cleanCompName,
        orgHandle: org.handle,
        projectHandle: project.handler,
    });

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
        showComponentDetails(org, project, createdComponent, createParams?.componentDir);
        linkedDirectoryStore?.getState().refreshState();
    }

    return createdComponent;
};
