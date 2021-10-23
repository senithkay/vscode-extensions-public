/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { FileType, TreeItem, TreeItemCollapsibleState, Uri, WorkspaceFolder } from "vscode";
import { join } from 'path';

export enum CMP_KIND {
    PACKAGE = "package",
    DEFAULT_MODULE = "default_module",
    MODULE = "module",
    FUNCTION = "Function",
    MAIN_FUNCTION = "main_function",
    FUNCTION_LABEL = "function_label",
    SERVICE = "service",
    RESOURCE = "Resource",
    SERVICE_LABEL = "service_label",
    RECORD = "record",
    RECORD_LABEL = "record_label",
    OBJECT = "object",
    OBJECT_LABEL = "object_label",
    TYPE = "type",
    TYPE_LABEL = "type_label",
    CONSTANT = "constant",
    CONSTANT_LABEL = "constant_label",
    ENUM = "enum",
    ENUM_LABEL = "enum_label",
    CLASS = "class",
    CLASS_LABEL = "class_label",
    METHOD = "method",
    LISTENER = "listener",
    LISTENER_LABEL = "listener_label",
    MODULE_LEVEL_VAR = "module_level_variable",
    MODULE_LEVEL_VAR_LABEL = "module_level_variable_label",
    ENTRY_POINT_LABEL = 'entry_point_label'
}

export enum EXPLORER_ITEM_KIND {
    BAL_FILE = 'ballerina_file',
    TOML_FILE = 'toml_file',
    OTHER_FILE = 'other_file',
    FOLDER = 'folder'
}

export enum FILE_EXTENSION {
    BAL = '.bal',
    TOML = '.toml'
}

export const TREE_ELEMENT_EXECUTE_COMMAND: string = 'ballerina.executeTreeElement';
export const OUTLINE_TREE_REFRESH_COMMAND: string = 'ballerina.refreshPackageTree';
export const EXPLORER_TREE_REFRESH_COMMAND: string = 'ballerina.refreshExplorerTree';
export const EXPLORER_TREE_NEW_FILE_COMMAND: string = 'ballerina.newFileExplorerTree';
export const EXPLORER_TREE_NEW_FOLDER_COMMAND: string = 'ballerina.newFolderExplorerTree';
export const EXPLRER_TREE_DELETE_FILE_COMMAND: string = 'ballerina.deleteFileExplorerTree';
export const EXPLORER_TREE_NEW_MODULE_COMMAND: string = 'ballerina.new.module';

export class ExplorerTreeItem extends TreeItem {
    private folder: WorkspaceFolder | undefined;
    private uri: Uri;
    private type: FileType;
    private kind: string;

    constructor(public readonly label: string, public readonly collapsibleState:
        TreeItemCollapsibleState, kind: string, uri: Uri, type: FileType) {
        super(label, collapsibleState);
        this.uri = uri;
        this.type = type
        this.kind = kind;
    }

    getFolder(): WorkspaceFolder | undefined {
        return this.folder
    }

    getUri(): Uri {
        return this.uri;
    }

    getFileType(): FileType {
        return this.type;
    }

    getKind(): string {
        return this.kind;
    }
}

export class PackageTreeItem extends TreeItem {
    private kind: string;
    private filePath: string;
    private extensionPath: string;
    private parent: PackageTreeItem | null;
    private childrenData: ChildrenData;
    private startLine: number;
    private startColumn: number;
    private isSingleFile: boolean;

    constructor(public readonly label: string, private version: string, public readonly collapsibleState:
        TreeItemCollapsibleState, kind: string, filePath: string, extensionPath: string, hasIcon: boolean,
        parent: PackageTreeItem | null, childrenData: ChildrenData, startLine: number = -1, startColumn: number = -1,
        isSingleFile: boolean = false
    ) {
        super(label, collapsibleState);
        this.tooltip = `${this.label} ${kind}`;
        this.description = this.version;
        this.filePath = filePath;
        this.extensionPath = extensionPath;
        this.childrenData = childrenData;
        this.parent = parent;
        this.startLine = startLine;
        this.startColumn = startColumn;
        this.isSingleFile = isSingleFile;

        if (hasIcon) {
            let iconName = kind;
            if (kind === CMP_KIND.DEFAULT_MODULE) {
                iconName = 'module';
            } else if (kind === CMP_KIND.FUNCTION_LABEL || kind === CMP_KIND.SERVICE_LABEL) {
                iconName = CMP_KIND.MODULE;
            }
            this.iconPath = {
                light: join(this.extensionPath, 'resources', 'images', 'icons', `${iconName.toLowerCase()}.svg`),
                dark: join(this.extensionPath, 'resources', 'images', 'icons', `${iconName.toLowerCase()}-inverse.svg`)
            };
        }

        this.kind = kind === CMP_KIND.MAIN_FUNCTION ? CMP_KIND.FUNCTION : kind;
        this.command = {
            command: TREE_ELEMENT_EXECUTE_COMMAND,
            title: "Execute Tree Command",
            arguments: [
                this.filePath,
                this.kind,
                this.startLine,
                this.startColumn,
                this.label
            ]
        };
    }

    getParent(): PackageTreeItem | null {
        return this.parent;
    }

    setChildrenData(response) {
        this.childrenData = response;
    }

    getChildrenData() {
        return this.childrenData;
    }

    getFilePath() {
        return this.filePath;
    }

    getStartLine() {
        return this.startLine;
    }

    getStartColumn() {
        return this.startColumn;
    }

    getKind() {
        return this.kind;
    }

    getIsSingleFile() {
        return this.isSingleFile;
    }

    getName() {
        return this.label;
    }
}

export interface ChildrenData {
    functions?: Leaf[];
    services?: Service[];
    resources?: Leaf[];
    records?: Leaf[];
    objects?: Leaf[];
    types?: Leaf[];
    constants?: Leaf[];
    enums?: Leaf[];
    classes?: Class[];
    modules?: Module[];
    listeners?: Leaf[];
    moduleVariables?: Leaf[];
    methods?: Leaf[];
    entryPoint?: Leaf[]
}

export interface Package {
    name: string;
    filePath: string;
    modules: Module[];
}

export interface Module {
    name?: string;
    default?: boolean;
    functions: Leaf[];
    records?: Leaf[];
    objects?: Leaf[];
    types?: Leaf[];
    constants?: Leaf[];
    enums?: Leaf[];
    classes?: Class[];
    services: Service[];
    listeners?: Leaf[];
    moduleVariables?: Leaf[];
}

export interface Leaf {
    name: string;
    filePath: string;
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
}

interface Service {
    name: string;
    filePath: string;
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
    resources: Leaf[];
}

interface Class {
    name: string;
    filePath: string;
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
    functions: Leaf[];
}
