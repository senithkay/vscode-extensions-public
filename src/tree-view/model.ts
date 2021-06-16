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

import { TreeItem, TreeItemCollapsibleState } from "vscode";
import { join } from 'path';

export enum CMP_KIND {
    PACKAGE = "package",
    DEFAULT_MODULE = "default_module",
    MODULE = "module",
    FUNCTION = "Function",
    MAIN_FUNCTION = "main_function",
    SERVICE = "service",
    RESOURCE = "Resource"
}

export const TREE_ELEMENT_EXECUTE_COMMAND: string = 'ballerina.executeTreeElement';
export const TREE_REFRESH_COMMAND: string = 'ballerina.refreshPackageTree';

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
            const iconName = kind === CMP_KIND.DEFAULT_MODULE ? 'module' : kind;
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
    functions?: FunctionOrResource[];
    services?: Service[];
    resources?: FunctionOrResource[];
    modules?: Module[];
}

export interface Package {
    name: string;
    filePath: string;
    modules: Module[];
}

export interface Module {
    name?: string;
    default?: boolean;
    functions: FunctionOrResource[];
    services: Service[];
}

interface FunctionOrResource {
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
    resources: FunctionOrResource[];
}
