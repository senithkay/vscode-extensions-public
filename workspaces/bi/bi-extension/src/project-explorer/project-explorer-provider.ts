/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import { window, Uri } from 'vscode';
import path = require('path');
import { DIRECTORY_MAP, ProjectStructureArtifactResponse, ProjectStructureResponse, SHARED_COMMANDS, BI_COMMANDS, buildProjectStructure, PackageConfigSchema, BallerinaProject, DIRECTORY_SUB_TYPE } from "@wso2-enterprise/ballerina-core";
import { extension } from "../biExtentionContext";

interface Property {
    name?: string;
    type: string;
    additionalProperties?: { type: string };
    properties?: {};
    required?: string[];
    description?: string;
    items?: Property;
}
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
            // console.log(this.iconPath, "this.iconPath");
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

    constructor(isBallerina: boolean) {
        this._data = [];
        isBallerina && this.refresh();
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
        if (extension.langClient && extension.projectPath) {
            const workspace = vscode
                .workspace
                .workspaceFolders
                .find(folder => folder.uri.fsPath === extension.projectPath);

            if (!workspace) {
                return [];
            }

            const resp = await buildProjectStructure(extension.projectPath, extension.langClient);
            // Add all the configurations to the project tree
            // await addConfigurations(rootPath, resp);
            const projectTree = generateTreeData(workspace, resp);
            if (projectTree) {
                data.push(projectTree);
            }

            return data;
        }
    }
    return [];
}

function generateTreeData(project: vscode.WorkspaceFolder, components: ProjectStructureResponse): ProjectExplorerEntry | undefined {
    const projectRootPath = project.uri.fsPath;
    const projectRootEntry = new ProjectExplorerEntry(
        `${project.name}`,
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
        'start',
        false
    );
    entryPoints.contextValue = "entryPoint";
    entryPoints.children = getComponents(components.directoryMap[DIRECTORY_MAP.SERVICES], DIRECTORY_MAP.SERVICES);
    if (components.directoryMap[DIRECTORY_MAP.AUTOMATION].length > 0) {
        entryPoints.children.push(...getComponents(components.directoryMap[DIRECTORY_MAP.AUTOMATION], DIRECTORY_MAP.AUTOMATION));
    }
    entries.push(entryPoints);

    // Listeners
    const listeners = new ProjectExplorerEntry(
        "Listeners",
        vscode.TreeItemCollapsibleState.Expanded,
        null,
        'bell',
        true
    );
    listeners.contextValue = "listeners";
    listeners.children = getComponents(components.directoryMap[DIRECTORY_MAP.LISTENERS], DIRECTORY_MAP.LISTENERS);
    entries.push(listeners);

    // Connections
    const connections = new ProjectExplorerEntry(
        "Connections",
        vscode.TreeItemCollapsibleState.Expanded,
        null,
        'connection',
        false
    );
    connections.contextValue = "connections";
    connections.children = getComponents(components.directoryMap[DIRECTORY_MAP.CONNECTIONS], DIRECTORY_MAP.CONNECTIONS);

    entries.push(connections);

    // Types
    const types = new ProjectExplorerEntry(
        "Types",
        vscode.TreeItemCollapsibleState.Expanded,
        null,
        'type',
        false
    );
    types.contextValue = "types";
    types.children = getComponents([
        ...components.directoryMap[DIRECTORY_MAP.TYPES],
        ...components.directoryMap[DIRECTORY_MAP.RECORDS],
        ...components.directoryMap[DIRECTORY_MAP.ENUMS],
        ...components.directoryMap[DIRECTORY_MAP.CLASSES]
    ], DIRECTORY_MAP.TYPES);
    entries.push(types);

    // Functions
    const functions = new ProjectExplorerEntry(
        "Functions",
        vscode.TreeItemCollapsibleState.Expanded,
        null,
        'function',
        false
    );
    functions.contextValue = "functions";
    functions.children = getComponents(components.directoryMap[DIRECTORY_MAP.FUNCTIONS], DIRECTORY_MAP.FUNCTIONS);
    entries.push(functions);

    // Data Mappers
    const dataMappers = new ProjectExplorerEntry(
        "Data Mappers",
        vscode.TreeItemCollapsibleState.Expanded,
        null,
        'dataMapper',
        false
    );
    dataMappers.contextValue = "dataMappers";
    dataMappers.children = getComponents(components.directoryMap[DIRECTORY_MAP.DATA_MAPPERS], DIRECTORY_MAP.DATA_MAPPERS);
    entries.push(dataMappers);

    // Configurations
    const configs = new ProjectExplorerEntry(
        "Configurations",
        vscode.TreeItemCollapsibleState.Expanded,
        null,
        'config',
        false
    );
    configs.contextValue = "configurations";
    configs.children = getComponents(components.directoryMap[DIRECTORY_MAP.CONFIGURATIONS], DIRECTORY_MAP.CONFIGURATIONS);
    entries.push(configs);

    // Natural Functions
    const naturalFunctions = new ProjectExplorerEntry(
        "Natural Functions",
        vscode.TreeItemCollapsibleState.Expanded,
        null,
        'function',
        false
    );
    naturalFunctions.contextValue = "naturalFunctions";
    naturalFunctions.children = getComponents(components.directoryMap[DIRECTORY_MAP.NATURAL_FUNCTIONS], DIRECTORY_MAP.NATURAL_FUNCTIONS);
    entries.push(naturalFunctions);

    return entries;
}

function getComponents(items: ProjectStructureArtifactResponse[], itemType?: DIRECTORY_MAP): ProjectExplorerEntry[] {
    if(!items) {
        return [];
    }
    const entries: ProjectExplorerEntry[] = [];
    const resetHistory = true;
    for (const comp of items) {
        const fileEntry = new ProjectExplorerEntry(
            comp.name,
            comp.resources.length > 0 ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None,
            comp.path,
            comp.icon
        );
        fileEntry.command = {
            "title": "Visualize",
            "command": SHARED_COMMANDS.SHOW_VISUALIZER,
            "arguments": [vscode.Uri.parse(comp.path), comp.position, resetHistory]
        };

        // Define a mapping for item types to context values
        const contextValueMap: { [key in DIRECTORY_MAP]: string } = {
            [DIRECTORY_MAP.SERVICES]: DIRECTORY_SUB_TYPE.SERVICE,
            [DIRECTORY_MAP.AUTOMATION]: DIRECTORY_SUB_TYPE.AUTOMATION,
            [DIRECTORY_MAP.CONNECTIONS]: DIRECTORY_SUB_TYPE.CONNECTION,
            [DIRECTORY_MAP.TYPES]: DIRECTORY_SUB_TYPE.TYPE,
            [DIRECTORY_MAP.FUNCTIONS]: DIRECTORY_SUB_TYPE.FUNCTION,
            [DIRECTORY_MAP.CONFIGURATIONS]: DIRECTORY_SUB_TYPE.CONFIGURATION,
            [DIRECTORY_MAP.TRIGGERS]: DIRECTORY_SUB_TYPE.TRIGGER,
            [DIRECTORY_MAP.LISTENERS]: DIRECTORY_SUB_TYPE.LISTENER,
            [DIRECTORY_MAP.RECORDS]: DIRECTORY_SUB_TYPE.TYPE,
            [DIRECTORY_MAP.ENUMS]: DIRECTORY_SUB_TYPE.TYPE,
            [DIRECTORY_MAP.CLASSES]: DIRECTORY_SUB_TYPE.TYPE,
            [DIRECTORY_MAP.DATA_MAPPERS]: DIRECTORY_SUB_TYPE.DATA_MAPPER,
            [DIRECTORY_MAP.AGENTS]: DIRECTORY_SUB_TYPE.AGENTS,
            [DIRECTORY_MAP.NATURAL_FUNCTIONS]: DIRECTORY_SUB_TYPE.NATURAL_FUNCTION
        };

        fileEntry.contextValue = contextValueMap[itemType] || comp.icon;
        // Service path is used to identify the service using getBallerniaProject API
        if (itemType === DIRECTORY_MAP.SERVICES || DIRECTORY_SUB_TYPE.AUTOMATION) {
            fileEntry.tooltip = comp.context;
        }

        fileEntry.children = getComponents(comp.resources);
        entries.push(fileEntry);
    }
    return entries;
}

async function addConfigurations(rootPath, resp) {
    const filePath = `${rootPath}/Ballerina.toml`;
    const response = await extension.langClient?.getBallerinaProjectConfigSchema({
        documentIdentifier: {
            uri: Uri.file(filePath).toString()
        }
    });
    const project = await extension.langClient.getBallerinaProject({
        documentIdentifier: {
            uri: Uri.file(filePath).toString()
        }
    }) as BallerinaProject;
    const packageName = project.packageName!;
    const resData = response as PackageConfigSchema;
    const configSchema = resData.configSchema;
    const props: object = configSchema.properties;
    let orgName;
    for (const key of Object.keys(props)) {
        if (props[key].properties[packageName]) {
            orgName = props[key].properties;
        }
    }
    if (orgName) {
        const configs: Property = orgName[packageName];
        const properties = configs.properties;
        for (let propertyKey in properties) {
            if (properties.hasOwnProperty(propertyKey)) {
                const property: Property = properties[propertyKey];
                resp.directoryMap[DIRECTORY_MAP.CONFIGURATIONS].push({ name: propertyKey, path: "", type: property.type, icon: "local-entry" });
            }
        }
    }
}
