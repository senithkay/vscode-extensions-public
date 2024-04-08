/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { window, QuickPickItem, QuickPickItemKind, workspace, WorkspaceFolder } from "vscode";
import { ext } from "../../extensionVariables";
import { ComponentKind, Organization, Project, UserInfo } from "@wso2-enterprise/choreo-core";

export const selectComponent = async (org: Organization, project: Project): Promise<ComponentKind> => {
    const components = await quickPickLoader(
        ext.clients.rpcClient.getComponentList({
            orgId: org.id.toString(),
            projectHandle: project.handler,
        }),
        "Loading Components..."
    );

    const componentItems: QuickPickItem[] = components?.map((item) => ({ label: item.metadata.name }));

    const componentSelection = await window.showQuickPick(componentItems, {
        title: "Select Component",
        ignoreFocusOut: true,
    });

    const selectedComponent = components?.find((item) => item.metadata.name === componentSelection?.label);

    if (!selectedComponent) {
        throw new Error("Failed to select component");
    }

    return selectedComponent;
};

export const selectProject = async (org: Organization): Promise<Project> => {
    const projects = await quickPickLoader(ext.clients.rpcClient.getProjects(org.id.toString()), "Loading Projects...");

    if(projects.length === 0){
        throw new Error("You do not have any existing components or projects. Please try creating one.");
    }

    if(projects.length === 1){
        return projects[0];
    }

    const projectItems: QuickPickItem[] = projects?.map((item) => ({
        label: item.name,
        detail: `Handle: ${item.handler}`,
    }));

    const projectSelection = await window.showQuickPick(projectItems, {
        title: "Select Project",
        ignoreFocusOut: true,
    });

    const selectedProject = projects?.find((item) => item.name === projectSelection?.label);

    if (!selectedProject) {
        throw new Error("Failed to select project");
    }

    return selectedProject;
};

export const selectProjectWithCreateNew = async (org: Organization): Promise<Project | "new-project"> => {
    const projects = await quickPickLoader(ext.clients.rpcClient.getProjects(org.id.toString()), "Loading Projects...");

    const projectItems: QuickPickItem[] = [];

    if(projects.length === 0) {
        return "new-project";
    } else if(projects.length > 0){
        projectItems.push({ kind: QuickPickItemKind.Separator, label: "Existing projects" });
        projectItems.push(...projects?.map((item) => ({
            label: item.name,
            detail: `Handle: ${item.handler}`,
        })));
    }

    projectItems.push({ kind: QuickPickItemKind.Separator, label: "New Project" });
    projectItems.push({ label: "Create New", detail: `Create new project within ${org.name} organization`, alwaysShow: true });

    const projectSelection = await window.showQuickPick(projectItems, {
        title: "Select Project",
        ignoreFocusOut: true,
    });

    if (projectSelection?.label === "Create New") {
        return "new-project";
    }

    const selectedProject = projects?.find((item) => item.name === projectSelection?.label);

    if (!selectedProject) {
        throw new Error("Failed to select project");
    }

    return selectedProject;
};

export const selectOrg = async (userInfo: UserInfo): Promise<Organization> => {
    const items: QuickPickItem[] = userInfo.organizations?.map((item) => ({
        label: item.name,
        detail: `Handle: ${item.handle}`,
    }));

    if(items.length === 0){
        throw new Error("Please visit Choreo to create a new organization");
    }

    if(userInfo.organizations.length === 1){
        return userInfo.organizations[0];
    }

    const orgSelection = await window.showQuickPick(items, { title: "Select Organization", ignoreFocusOut: true });

    const selectedOrg = userInfo.organizations.find((item) => item.name === orgSelection?.label);

    if (!selectedOrg) {
        throw new Error("Failed to select organization");
    }

    return selectedOrg;
};

export const resolveWorkspaceDirectory = async (): Promise<WorkspaceFolder> => {
    if (workspace.workspaceFolders?.length === 0) {
        throw new Error("Directory is required in order to proceed");
    } else if (workspace.workspaceFolders?.length === 1) {
        return workspace.workspaceFolders[0];
    } else {
        const items: QuickPickItem[] = workspace.workspaceFolders!.map((item) => ({
            label: item.name,
            detail: item.uri.path,
        }));

        const directorySelection = await window.showQuickPick(items, {
            title: "Select Directory",
            ignoreFocusOut: true,
        });
        return workspace.workspaceFolders?.find((item) => item.name === directorySelection?.label)!;
    }
};

async function quickPickLoader<T>(promise: Promise<T>, ladingMessage: string = "Loading..."): Promise<T> {
    const projectsQuickPick = window.createQuickPick();
    projectsQuickPick.busy = true;
    projectsQuickPick.title = ladingMessage;
    projectsQuickPick.show();
    projectsQuickPick.ignoreFocusOut = true;

    try {
        const result = await promise;
        return result;
    } finally {
        projectsQuickPick.hide();
    }
}
