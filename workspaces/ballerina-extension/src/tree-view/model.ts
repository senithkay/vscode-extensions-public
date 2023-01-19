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

export enum EXPLORER_ITEM_KIND {
    BAL_FILE = 'ballerina_file',
    TOML_FILE = 'toml_file',
    OTHER_FILE = 'other_file',
    CONFIG_TOML_FILE = 'config_toml_file',
    FOLDER = 'folder'
}

export enum FILE_EXTENSION {
    BAL = '.bal',
    TOML = '.toml'
}

export enum FILE_NAME {
    BALLERINA_TOML = 'Ballerina.bal',
    CONFIG_TOML = 'Config.toml'
}

export const TREE_ELEMENT_EXECUTE_COMMAND: string = 'ballerina.executeTreeElement';
export const OUTLINE_TREE_REFRESH_COMMAND: string = 'ballerina.refreshPackageTree';
export const EXPLORER_TREE_REFRESH_COMMAND: string = 'ballerina.refreshExplorerTree';
export const EXPLORER_TREE_NEW_FILE_COMMAND: string = 'ballerina.newFileExplorerTree';
export const EXPLORER_TREE_NEW_FOLDER_COMMAND: string = 'ballerina.newFolderExplorerTree';
export const EXPLRER_TREE_DELETE_FILE_COMMAND: string = 'ballerina.deleteFileExplorerTree';
export const EXPLORER_TREE_NEW_MODULE_COMMAND: string = 'ballerina.new.module';
export const DOCUMENTATION_VIEW = 'ballerina.documentationView.open';

export class ExplorerTreeItem extends TreeItem {
    private folder: WorkspaceFolder | undefined;
    private uri: Uri;
    private type: FileType;
    private kind: string;

    constructor(public readonly label: string, public readonly collapsibleState:
        TreeItemCollapsibleState, kind: string, uri: Uri, type: FileType) {
        super(label, collapsibleState);
        this.uri = uri;
        this.type = type;
        this.kind = kind;
    }

    getFolder(): WorkspaceFolder | undefined {
        return this.folder;
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
    entryPoint?: Leaf[];
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
