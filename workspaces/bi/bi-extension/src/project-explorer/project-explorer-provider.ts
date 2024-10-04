/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import { window } from 'vscode';
import path = require('path');
import { DIRECTORY_MAP, ProjectStructureArtifactResponse, ProjectStructureResponse, SHARED_COMMANDS, BI_COMMANDS, buildProjectStructure } from "@wso2-enterprise/ballerina-core";
import { extension } from "../biExtentionContext";

export class ProjectExplorerEntry extends vscode.TreeItem {
    children: ProjectExplorerEntry[] | undefined;
    info: string | undefined;

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        info: string | undefined = undefined,
        icon: string = 'folder',
        isCodicon: boolean = false
    ) {
        super(label, collapsibleState);
        this.tooltip = `${this.label}`;
        this.info = info;
        if (icon && isCodicon) {
            this.iconPath = new vscode.ThemeIcon(icon);
        } else if (icon) {
            this.iconPath = {
                light: path.join(extension.context.extensionPath, 'assets', `light-${icon}.svg`),
                dark: path.join(extension.context.extensionPath, 'assets', `dark-${icon}.svg`)
            };
            console.log(this.iconPath, "this.iconPath");
        }
    }
}

export class ProjectExplorerEntryProvider implements vscode.TreeDataProvider<ProjectExplorerEntry> {
    private _data: ProjectExplorerEntry[];
    private _onDidChangeTreeData: vscode.EventEmitter<ProjectExplorerEntry | undefined | null | void>
        = new vscode.EventEmitter<ProjectExplorerEntry | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ProjectExplorerEntry | undefined | null | void>
        = this._onDidChangeTreeData.event;

    refresh(): void {
        window.withProgress({
            location: { viewId: BI_COMMANDS.PROJECT_EXPLORER },
            title: 'Loading project structure'
        }, async () => {
            await getProjectStructureData()
                .then(data => {
                    this._data = data;
                })
                .catch(err => {
                    console.error(err);
                    this._data = [];
                });

            this._onDidChangeTreeData.fire();
        });
    }

    constructor(isBI: boolean) {
        this._data = [];
        isBI && this.refresh();
    }

    getTreeItem(element: ProjectExplorerEntry): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: ProjectExplorerEntry | undefined): vscode.ProviderResult<ProjectExplorerEntry[]> {
        if (element === undefined) {
            return this._data;
        }
        return element.children;
    }

    getParent(element: ProjectExplorerEntry): vscode.ProviderResult<ProjectExplorerEntry> {
        if (element.info === undefined) return undefined;

        const projects = (this._data);
        for (const project of projects) {
            if (project.children?.find(child => child.info === element.info)) {
                return project;
            }
            const fileElement = this.recursiveSearchParent(project, element.info);
            if (fileElement) {
                return fileElement;
            }
        }
        return element;
    }

    recursiveSearchParent(element: ProjectExplorerEntry, path: string): ProjectExplorerEntry | undefined {
        if (!element.children) {
            return undefined;
        }
        for (const child of element.children) {
            if (child.info === path) {
                return element;
            }
            const foundParent = this.recursiveSearchParent(child, path);
            if (foundParent) {
                return foundParent;
            }
        }
        return undefined;
    }
}

async function getProjectStructureData(): Promise<ProjectExplorerEntry[]> {
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        const data: ProjectExplorerEntry[] = [];
        if (extension.langClient) {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            for (const workspace of workspaceFolders) {
                const rootPath = workspace.uri.fsPath;
                const resp = await buildProjectStructure(rootPath, extension.langClient);
                const projectTree = generateTreeData(workspace, resp);
                if (projectTree) {
                    data.push(projectTree);
                }
            };
            return data;
        }
    }
    return [];

}

function generateTreeData(project: vscode.WorkspaceFolder, components: ProjectStructureResponse): ProjectExplorerEntry | undefined {
    const projectRootPath = project.uri.fsPath;
    const projectRootEntry = new ProjectExplorerEntry(
        `Project ${project.name}`,
        vscode.TreeItemCollapsibleState.Expanded,
        projectRootPath,
        'project',
        true
    );

    projectRootEntry.contextValue = 'bi-project';

    const children = getEntriesBI(components);
    projectRootEntry.children = children;

    return projectRootEntry;
}

function getEntriesBI(components: ProjectStructureResponse): ProjectExplorerEntry[] {
    const entries: ProjectExplorerEntry[] = [];

    // Entry Points
    const entryPoints = new ProjectExplorerEntry(
        "Entry Points",
        vscode.TreeItemCollapsibleState.Expanded,
        null,
        'folder',
        true
    );
    entryPoints.contextValue = "entryPoint";
    entryPoints.children = getComponents(components.directoryMap[DIRECTORY_MAP.SERVICES]);
    entries.push(entryPoints);

    // Connections
    const connections = new ProjectExplorerEntry(
        "Connections",
        vscode.TreeItemCollapsibleState.Expanded,
        null,
        'folder',
        true
    );
    connections.contextValue = "connections";
    connections.children = getComponents(components.directoryMap[DIRECTORY_MAP.CONNECTIONS]);
    entries.push(connections);

    // Connections
    const schemas = new ProjectExplorerEntry(
        "Schemas",
        vscode.TreeItemCollapsibleState.Collapsed,
        null,
        'folder',
        true
    );
    schemas.contextValue = "schemas";
    schemas.children = getComponents(components.directoryMap[DIRECTORY_MAP.SCHEMAS]);
    entries.push(schemas);

    // Functions
    const functions = new ProjectExplorerEntry(
        "Functions",
        vscode.TreeItemCollapsibleState.Collapsed,
        null,
        'folder',
        true
    );
    functions.contextValue = "functions";
    functions.children = getComponents(components.directoryMap[DIRECTORY_MAP.TASKS]);
    entries.push(functions);

    // Configurations
    const configs = new ProjectExplorerEntry(
        "Configurations",
        vscode.TreeItemCollapsibleState.Collapsed,
        null,
        'folder',
        true
    );
    configs.contextValue = "configurations";
    configs.children = getComponents(components.directoryMap[DIRECTORY_MAP.CONFIGURATIONS]);
    entries.push(configs);

    return entries;
}

function getComponents(items: ProjectStructureArtifactResponse[]): ProjectExplorerEntry[] {
    const entries: ProjectExplorerEntry[] = [];
    for (const comp of items) {
        const fileEntry = new ProjectExplorerEntry(
            comp.name,
            vscode.TreeItemCollapsibleState.None,
            comp.path,
            comp.icon
        );
        fileEntry.command = {
            "title": "Visualize",
            "command": SHARED_COMMANDS.SHOW_VISUALIZER,
            "arguments": [vscode.Uri.parse(comp.path), comp.position]
        };
        entries.push(fileEntry);
    }
    return entries;
}
