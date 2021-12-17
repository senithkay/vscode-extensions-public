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

import {
    Event, EventEmitter, FileStat, FileType, TreeDataProvider, TreeItem, TreeItemCollapsibleState, Uri, workspace
} from "vscode";
import { ExplorerTreeItem, EXPLORER_ITEM_KIND, FILE_EXTENSION, FILE_NAME, TREE_ELEMENT_EXECUTE_COMMAND } from "./model";
import * as fs from 'fs';
import * as path from 'path';
import { debug } from "../utils";

/**
 * Tree data provider for explorer view.
 */
export class ExplorerDataProvider implements TreeDataProvider<ExplorerTreeItem> {
    private _onDidChangeTreeData: EventEmitter<ExplorerTreeItem | undefined> = new EventEmitter<ExplorerTreeItem
        | undefined>();
    readonly onDidChangeTreeData: Event<ExplorerTreeItem | undefined> = this._onDidChangeTreeData.event;

    constructor() {
        workspace.onDidChangeWorkspaceFolders(listener => {
            if (listener.added.length > 0 || listener.removed.length > 0) {
                this.refresh();
            }
        });

        const fileWatcher = workspace.createFileSystemWatcher("**/*", false, true, false);
        fileWatcher.onDidCreate(listener => {
            if (path.dirname(listener.fsPath).split(path.sep).pop() === '.git') {
                return;
            }
            debug(`Refresh diagram explorer view for ${listener.fsPath} create.`);
            this.refresh();
        });
        fileWatcher.onDidDelete(listener => {
            if (path.dirname(listener.fsPath).split(path.sep).pop() === '.git') {
                return;
            }
            debug(`Refresh diagram explorer view for ${listener.fsPath} delete`);
            this.refresh();
        })
    }

    async _stat(path: string): Promise<FileStat> {
        return new FileStatClass(await _.stat(path));
    }

    readDirectory(uri: Uri): [string, FileType][] | Thenable<[string, FileType][]> {
        return this._readDirectory(uri);
    }

    async _readDirectory(uri: Uri): Promise<[string, FileType][]> {
        const children = await _.readdir(uri.fsPath);

        const result: [string, FileType][] = [];
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const stat = await this._stat(path.join(uri.fsPath, child));
            result.push([child, stat.type]);
        }

        return Promise.resolve(result);
    }


    getTreeItem(element: ExplorerTreeItem): TreeItem | Thenable<TreeItem> {
        const treeItem = new TreeItem(element.getUri(), element.getFileType() === FileType.Directory ?
            element.label == 'workspace' ? TreeItemCollapsibleState.Expanded : TreeItemCollapsibleState.Collapsed
            : TreeItemCollapsibleState.None);
        if (element.getFileType() === FileType.File) {
            if (element.getKind() === EXPLORER_ITEM_KIND.BAL_FILE) {
                treeItem.command = {
                    command: TREE_ELEMENT_EXECUTE_COMMAND,
                    title: "Execute Tree Command",
                    arguments: [
                        element.getUri().fsPath,
                        element.getKind(),
                        0,
                        0,
                        element.label
                    ]
                };
            } else {
                treeItem.command = {
                    command: 'vscode.open',
                    title: "Open file Command",
                    arguments: [
                        element.getUri()
                    ]
                };
            }
            treeItem.contextValue = 'file';
        } else {
            treeItem.contextValue = 'folder';
        }
        return treeItem;
    }

    async getChildren(element?: ExplorerTreeItem): Promise<ExplorerTreeItem[]> {

        let files: ExplorerTreeItem[] = [];
        if (element) {
            const children = await this.readDirectory(element.getUri());
            return this.addChildrenTreeItems(children, element.getUri().fsPath, files);
        }
        if (!workspace.workspaceFolders) {
            return [];
        }

        for (let i = 0; i < workspace.workspaceFolders.length; i++) {
            const workspaceFolder = workspace.workspaceFolders[i];
            files.push(new ExplorerTreeItem(workspaceFolder.name, TreeItemCollapsibleState.Expanded,
                EXPLORER_ITEM_KIND.FOLDER, workspaceFolder.uri, FileType.Directory));
        }
        return files;
    }

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
        debug("Refresh diagram explorer view.");
    }

    private addChildrenTreeItems(children: [string, FileType][], parentPath: string, files: ExplorerTreeItem[]):
        ExplorerTreeItem[] {
        children.forEach(child => {
            const filePath: Uri = Uri.file(path.join(parentPath, child[0]));
            if (child[1] === FileType.Directory) {
                if (child[0] != 'target') {
                    files.push(new ExplorerTreeItem(child[0], TreeItemCollapsibleState.Expanded,
                        EXPLORER_ITEM_KIND.FOLDER, filePath, FileType.Directory));
                }
            } else {
                const extension: string = path.extname(filePath.fsPath);
                const fileName: string = path.basename(filePath.fsPath);
                let kind = EXPLORER_ITEM_KIND.OTHER_FILE;
                if (extension === FILE_EXTENSION.BAL) {
                    kind = EXPLORER_ITEM_KIND.BAL_FILE;
                } else if (extension === FILE_EXTENSION.TOML) {
                    if (fileName == FILE_NAME.CONFIG_TOML) {
                        kind = EXPLORER_ITEM_KIND.CONFIG_TOML_FILE;
                    } else {
                        kind = EXPLORER_ITEM_KIND.TOML_FILE;
                    }
                }
                files.push(new ExplorerTreeItem(child[0], TreeItemCollapsibleState.None,
                    kind, filePath, FileType.File));
            }
        });
        return files;
    }
}

namespace _ {

    function handleResult<T>(resolve: (result: T) => void, reject: (error: Error) => void, error: Error | null |
        undefined, result: T): void {
        if (error) {
            reject(error);
        } else {
            resolve(result);
        }
    }

    export function normalizeNFC(items: string): string;
    export function normalizeNFC(items: string[]): string[];
    export function normalizeNFC(items: string | string[]): string | string[] {
        if (process.platform !== 'darwin') {
            return items;
        }

        if (Array.isArray(items)) {
            return items.map(item => item.normalize('NFC'));
        }

        return items.normalize('NFC');
    }

    export function readdir(path: string): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            fs.readdir(path, (error, children) => handleResult(resolve, reject, error, normalizeNFC(children)));
        });
    }

    export function stat(path: string): Promise<fs.Stats> {
        return new Promise<fs.Stats>((resolve, reject) => {
            fs.stat(path, (error, stat) => handleResult(resolve, reject, error, stat));
        });
    }
}

export class FileStatClass implements FileStat {

    constructor(private fsStat: fs.Stats) { }

    get type(): FileType {
        return this.fsStat.isFile() ? FileType.File : this.fsStat.isDirectory() ? FileType.Directory :
            this.fsStat.isSymbolicLink() ? FileType.SymbolicLink : FileType.Unknown;
    }

    get size(): number {
        return this.fsStat.size;
    }

    get ctime(): number {
        return this.fsStat.ctime.getTime();
    }

    get mtime(): number {
        return this.fsStat.mtime.getTime();
    }
}
