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
import { Event, ProviderResult, TreeDataProvider, TreeItem, TreeItemCollapsibleState } from "vscode";
import { join } from "path";

export class SessionDataProvider implements TreeDataProvider<TreeItem> {
    private ballerinaExtension;
    constructor(ballerinaExtension: BallerinaExtension) {
        this.ballerinaExtension = ballerinaExtension;
    }
    onDidChangeTreeData?: Event<void | TreeItem | null | undefined> | undefined;
    getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
        return element;
    }
    getChildren(element?: TreeItem): ProviderResult<TreeItem[]> {
        let treeItems: TreeItem[] = [];
        if (!element) {
            const item = new TreeItem("Sign in to Choreo...", TreeItemCollapsibleState.None);
            item.iconPath = {
                light: join(this.ballerinaExtension.extension.extensionPath, 'resources', 'images', 'icons', 'signin.svg'),
                dark: join(this.ballerinaExtension.extension.extensionPath, 'resources', 'images', 'icons', 'signin-inverse.svg')
            }
            treeItems.push(item);
        }
        return treeItems;
    }
}