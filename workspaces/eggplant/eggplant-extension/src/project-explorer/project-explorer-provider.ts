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
import { VIEWS } from '../constants';

export class ProjectExplorerEntry extends vscode.TreeItem {
    children: ProjectExplorerEntry[] | undefined;
    info: string | undefined;

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        info: string | undefined = undefined,
        icon: string = 'folder'
    ) {
        super(label, collapsibleState);
        this.tooltip = `${this.label}`;
        this.info = info;
        this.iconPath = new vscode.ThemeIcon(icon);
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
            location: { viewId: VIEWS.PROJECT_EXPLORER },
            title: 'Loading project structure'
        }, async () => {
            await getProjectStructureData(this.context)
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

    constructor(private context: vscode.ExtensionContext) {
        this._data = [];
        this.refresh();
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

async function getProjectStructureData(context: vscode.ExtensionContext): Promise<ProjectExplorerEntry[]> {
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        const data: ProjectExplorerEntry[] = [];
        const workspaceFolders = vscode.workspace.workspaceFolders;
        for (const workspace of workspaceFolders) {
            const projectTree = generateTreeData(workspace, "DATA");
            if (projectTree) {
                data.push(projectTree);
            }
        };
        if (data.length > 0) {
            return data;
        }
    }
    return [];
}

function generateTreeData(project: vscode.WorkspaceFolder, data: string): ProjectExplorerEntry | undefined {
    const directoryMap = data;
    if (directoryMap) {
        const projectRoot = new ProjectExplorerEntry(
            `Project ${project.name}`,
            vscode.TreeItemCollapsibleState.Expanded,
            project.name,
            'project'
        );

        projectRoot.contextValue = 'project';

        return projectRoot;
    }
}
