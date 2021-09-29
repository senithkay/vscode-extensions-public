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
import { BallerinaExtension } from "../core";
import { Event, EventEmitter, ProviderResult, TreeDataProvider, TreeItem, TreeItemCollapsibleState, Uri, window, workspace, WorkspaceFolder } from "vscode";
import { ExplorerTreeItem, EXPLORER_ITEM_KIND, FILE_EXTENSION } from "./model";
import { lstatSync, readdirSync, statSync} from 'fs';
import { extname, sep} from 'path';
import fileUriToPath from "file-uri-to-path";

/**
 * Tree data provider for explorer view.
 */
export class ExplorerDataProvider implements TreeDataProvider<ExplorerTreeItem> {

    private ballerinaExtension: BallerinaExtension;
    private extensionPath: string;
    constructor(ballerinaExtension: BallerinaExtension) {
        this.ballerinaExtension = ballerinaExtension;
        this.extensionPath = ballerinaExtension.extension.extensionPath;
    }

    private _onDidChangeTreeData: EventEmitter<ExplorerTreeItem | undefined> = new EventEmitter<ExplorerTreeItem
        | undefined>();
    readonly onDidChangeTreeData: Event<ExplorerTreeItem | undefined> = this._onDidChangeTreeData.event;

    getTreeItem(element: ExplorerTreeItem): TreeItem | Thenable<TreeItem> {
        return element;
    }
    getChildren(element?: ExplorerTreeItem): ProviderResult<ExplorerTreeItem[]> {
        if (!this.ballerinaExtension.isSwanLake()) {
            window.showErrorMessage("Ballerina explorer is not supported in this Ballerina runtime version.");
            return;
        }
        if (!element) {
            return this.listRootLevel();
        } else {
            return this.listFiles(element);
        }
    }

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    private listRootLevel(): ExplorerTreeItem[] {
        let files: ExplorerTreeItem[] = [];
        if (!workspace.workspaceFolders) {
            return files;
        }
        workspace.workspaceFolders.forEach(file => {
            if (lstatSync(file.uri.fsPath).isDirectory()) {
                if (file.name !== 'target') {
                    files.push(new ExplorerTreeItem(file.name, TreeItemCollapsibleState.Expanded,
                        EXPLORER_ITEM_KIND.FOLDER, file.uri.fsPath, file, this.extensionPath));
                }
            } else {
                const extension: string = extname(fileUriToPath(file.uri.toString()));
                if (extension === FILE_EXTENSION.BAL) {
                    files.push(new ExplorerTreeItem(file.name, TreeItemCollapsibleState.None,
                        EXPLORER_ITEM_KIND.BAL_FILE, file.uri.fsPath, file, this.extensionPath));
                } else if (extension === FILE_EXTENSION.TOML) {
                    files.push(new ExplorerTreeItem(file.name, TreeItemCollapsibleState.None,
                        EXPLORER_ITEM_KIND.TOML_FILE, file.uri.fsPath, file, this.extensionPath));
                } else {
                    files.push(new ExplorerTreeItem(file.name, TreeItemCollapsibleState.None,
                        EXPLORER_ITEM_KIND.OTHER_FILE, file.uri.fsPath, file, this.extensionPath));
                }
            }

        });
        return files;
    }

    private listFiles(parent: ExplorerTreeItem): ExplorerTreeItem[] {
        let files: ExplorerTreeItem[] = [];
        let filePath: string;
        const folder: WorkspaceFolder | undefined = parent.getFolder();
        if (folder) {
            filePath = fileUriToPath(folder.uri.toString());
        } else {
            filePath = parent.getFilePath();
        }
        var list = readdirSync(filePath);
        list.forEach(function (file) {
            const tempFilePath = filePath + sep + file;
            var stat = statSync(tempFilePath);
            if (stat && stat.isDirectory()) {
                if (file !== 'target') {
                    files.push(new ExplorerTreeItem(file, TreeItemCollapsibleState.Collapsed,
                        EXPLORER_ITEM_KIND.FOLDER, tempFilePath, undefined, parent.getExtensionPath()));
                }
            } else {
                const extension: string = extname(Uri.file(tempFilePath).toString());
                if (extension === FILE_EXTENSION.BAL) {
                    files.push(new ExplorerTreeItem(file, TreeItemCollapsibleState.None, EXPLORER_ITEM_KIND.BAL_FILE,
                        tempFilePath, undefined, parent.getExtensionPath()));
                } else if (extension === FILE_EXTENSION.TOML) {
                    files.push(new ExplorerTreeItem(file, TreeItemCollapsibleState.None, EXPLORER_ITEM_KIND.TOML_FILE,
                        tempFilePath, undefined, parent.getExtensionPath()));
                } else {
                    files.push(new ExplorerTreeItem(file, TreeItemCollapsibleState.None, EXPLORER_ITEM_KIND.OTHER_FILE,
                        tempFilePath, undefined, parent.getExtensionPath()));
                }
            }
        });
        return files;
    }
}