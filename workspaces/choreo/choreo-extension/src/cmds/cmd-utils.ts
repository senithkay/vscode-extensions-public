/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { window, QuickPickItem, QuickPickItemKind, workspace, WorkspaceFolder } from "vscode";
import { ext } from "../extensionVariables";
import { ComponentKind, Organization, Project, UserInfo } from "@wso2-enterprise/choreo-core";
import { dataCacheStore } from "../stores/data-cache-store";

export const selectComponent = async (
    org: Organization,
    project: Project,
    loadingTitle = "Loading Components...",
    selectTitle = "Select Component"
): Promise<ComponentKind> => {
    const selectedComponent = await quickPickWithLoader({
        cacheQuickPicks: dataCacheStore
            .getState()
            .getComponents(org.handle, project.handler)
            .map((item) => ({ label: item.metadata.name, item })),
        loadQuickPicks: async () => {
            const components = await ext.clients.rpcClient.getComponentList({
                orgId: org.id.toString(),
                projectHandle: project.handler,
            });
            dataCacheStore.getState().setComponents(org.handle, project.handler, components);

            if (components.length === 0) {
                throw new Error(
                    "You do not have any existing components in your project. Please retry after creating one."
                );
            }

            return components.map((item) => ({ label: item.metadata.name, item }));
        },
        loadingTitle,
        selectTitle,
        placeholder: "Component Name",
    });

    if (!selectedComponent) {
        throw new Error("Failed to select component");
    }

    return selectedComponent;
};

export const selectProject = async (
    org: Organization,
    loadingTitle = "Loading projects...",
    selectTitle = "Select project"
): Promise<Project> => {
    const selectedProject = await quickPickWithLoader({
        cacheQuickPicks: dataCacheStore
            .getState()
            .getProjects(org.handle)
            .map((item) => ({ label: item.name, detail: `Handle: ${item.handler}`, item })),
        loadQuickPicks: async () => {
            const projects = await ext.clients.rpcClient.getProjects(org.id.toString());
            dataCacheStore.getState().setProjects(org.handle, projects);

            if (projects.length === 0) {
                throw new Error("You do not have any existing components or projects. Please try creating one.");
            }

            return projects.map((item) => ({ label: item.name, detail: `Handle: ${item.handler}`, item }));
        },
        loadingTitle,
        selectTitle,
        placeholder: "Project Name",
    });

    if (!selectedProject) {
        throw new Error("Failed to select project");
    }

    return selectedProject;
};

export const selectProjectWithCreateNew = async (
    org: Organization,
    loadingTitle = "Loading projects...",
    selectTitle = "Select project"
): Promise<Project | "new-project"> => {
    type ProjectQuickPick = QuickPickItem & { item?: Project };
    const projectQuickPicks: ProjectQuickPick[] = [];
    const projectCachePicks = dataCacheStore
        .getState()
        .getProjects(org.handle)
        .map((item) => ({ label: item.name, detail: `Handle: ${item.handler}`, item }));
    if (projectCachePicks.length > 0) {
        projectQuickPicks.push({ kind: QuickPickItemKind.Separator, label: "Existing projects" });
        projectQuickPicks.push(...projectCachePicks);
    }
    projectQuickPicks.push({ kind: QuickPickItemKind.Separator, label: "New Project" });
    projectQuickPicks.push({
        label: "Create New",
        detail: `Create new project within ${org.name} organization`,
        alwaysShow: true,
    });

    const quickPick = window.createQuickPick();
    quickPick.busy = true;
    quickPick.title = loadingTitle;
    quickPick.ignoreFocusOut = true;
    quickPick.placeholder = "Project Name";
    quickPick.items = projectQuickPicks;
    quickPick.show();

    ext.clients.rpcClient
        .getProjects(org.id.toString())
        .then((projects) => {
            dataCacheStore.getState().setProjects(org.handle, projects);
            quickPick.busy = false;
            quickPick.title = selectTitle || "Select an options";
            const updatedQuickPicks: ProjectQuickPick[] = [];
            const projectQuickPicks = projects?.map((item) => ({
                label: item.name,
                detail: `Handle: ${item.handler}`,
                item,
            }));
            if (projects?.length > 0) {
                updatedQuickPicks.push({ kind: QuickPickItemKind.Separator, label: "Existing projects" });
                updatedQuickPicks.push(...projectQuickPicks);
            }
            updatedQuickPicks.push({ kind: QuickPickItemKind.Separator, label: "New Project" });
            updatedQuickPicks.push({
                label: "Create New",
                detail: `Create new project within ${org.name} organization`,
                alwaysShow: true,
            });
        })
        .catch((err) => {
            quickPick.dispose();
            throw(err);
        });

    const selectedQuickPick = await new Promise((resolve) => {
        quickPick.onDidAccept(() => resolve(quickPick.selectedItems[0]));
        quickPick.onDidHide(() => resolve(null));
    });
    quickPick.dispose();

    if ((selectedQuickPick as QuickPickItem)?.label === "Create New") {
        return "new-project";
    } else if ((selectedQuickPick as ProjectQuickPick)?.item) {
        return (selectedQuickPick as ProjectQuickPick)?.item!;
    }

    throw new Error("Failed to select project");
};

export const selectOrg = async (userInfo: UserInfo, selectTitle = "Select organization"): Promise<Organization> => {
    const items: QuickPickItem[] = userInfo.organizations?.map((item) => ({
        label: item.name,
        detail: `Handle: ${item.handle}`,
    }));

    if (items.length === 0) {
        throw new Error("Please visit Choreo to create a new organization");
    }

    if (userInfo.organizations.length === 1) {
        return userInfo.organizations[0];
    }

    const orgSelection = await window.showQuickPick(items, {
        title: selectTitle,
        ignoreFocusOut: true,
        placeHolder: "Organization Name",
    });

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
            title: "Select Workspace",
            ignoreFocusOut: true,
        });
        return workspace.workspaceFolders?.find((item) => item.name === directorySelection?.label)!;
    }
};

export const resolveWorksQuickPick = async <T>(
    items: (QuickPickItem & { item: T })[] = [],
    quickPickTitle = "selectItem",
    emptyError = "No items found to pick"
): Promise<T> => {
    if (items?.length === 0) {
        throw new Error(emptyError);
    } else if (items?.length === 1) {
        return items[0]?.item;
    } else {
        const itemSelection = await window.showQuickPick(items, { title: quickPickTitle, ignoreFocusOut: true });
        if (!itemSelection?.item) {
            throw new Error("No items selected");
        }
        return itemSelection?.item;
    }
};

async function quickPickWithLoader<T>(params: {
    cacheQuickPicks?: (QuickPickItem & { item: T })[];
    loadQuickPicks: () => Promise<(QuickPickItem & { item: T })[]>;
    loadingTitle?: string;
    selectTitle?: string;
    placeholder?: string;
}): Promise<T | undefined | null> {
    const quickPick = window.createQuickPick();
    quickPick.busy = true;
    quickPick.title = params.loadingTitle || "Loading...";
    quickPick.ignoreFocusOut = true;
    quickPick.placeholder = params.placeholder;
    if (params.cacheQuickPicks) {
        quickPick.items = params.cacheQuickPicks;
    }
    quickPick.show();

    params
        .loadQuickPicks()
        .then((quickPickItems) => {
            quickPick.items = quickPickItems;
            quickPick.busy = false;
            quickPick.title = params.selectTitle || "Select an options";
        })
        .catch((err) => {
            quickPick.dispose();
            throw(err);
        });

    const selectedQuickPick = await new Promise((resolve) => {
        quickPick.onDidAccept(() => resolve(quickPick.selectedItems[0]));
        quickPick.onDidHide(() => resolve(null));
    });
    quickPick.dispose();
    const selectedT = (selectedQuickPick as QuickPickItem & { item: T })?.item;

    return selectedT;
}
