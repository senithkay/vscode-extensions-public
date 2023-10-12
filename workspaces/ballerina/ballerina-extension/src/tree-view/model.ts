/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
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
