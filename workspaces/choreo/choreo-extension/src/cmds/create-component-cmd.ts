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
import { getUserInfoForCmd } from "./cmd-utils";
import * as path from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { getSubPath, makeURLSafe } from "../utils";
import * as yaml from "js-yaml";
import { showComponentDetailsView } from "../views/webviews/ComponentDetailsView";
import { contextStore } from "../stores/context-store";
import { dataCacheStore } from "../stores/data-cache-store";

let componentWizard: ComponentFormView;

export function createNewComponentCommand(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand(CommandIds.CreateNewComponent, async (params: ICreateComponentParams) => {
            try {
                const userInfo = await getUserInfoForCmd("create a component");
                if (userInfo) {
                    const selected = contextStore.getState().state.selected;
                    if (!selected) {
                        throw new Error("Please set the project context and try again");
                    }

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

                    if (componentWizard) {
                        componentWizard.dispose();
                    }

                    if (selected.contextDirs.length === 0) {
                        throw new Error("Directories associated with the selected project not deleted");
                    }

                    componentWizard = new ComponentFormView(ext.context.extensionUri, {
                        directoryPath: selected.contextDirs?.[0].dirFsPath,
                        directoryFsPath: selected.contextDirs?.[0].dirFsPath,
                        directoryName: selected.contextDirs?.[0].workspaceName,
                        organization: selected.org!,
                        project: selected.project!,
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

        contextStore.getState().refreshState();
    }

    return createdComponent;
};
