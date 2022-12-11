/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import { EventEmitter, ProviderResult, TreeDataProvider, TreeItem, TreeItemCollapsibleState, Uri } from "vscode";
import { getProjectsByOrg } from "../../api/queries";
import { ext } from "../../extensionVariables";
import { ChoreoSignInPendingTreeItem } from "../common/ChoreoSignInTreeItem";
import { ChoreoProjectTreeItem } from "./ProjectTreeItem";

export type ProjectTreeItem =ChoreoProjectTreeItem | ChoreoSignInPendingTreeItem;

export class ProjectsTreeProvider implements TreeDataProvider<ProjectTreeItem> {

    private _onDidChangeTreeData = new EventEmitter<ProjectTreeItem | undefined | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor() {
        const subscription = ext.api.onStatusChanged(() => {
            this.refresh();
        });
        ext.context.subscriptions.push(subscription);
    }

    getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
        return element;
    }

    getChildren(element?: TreeItem): ProviderResult<ProjectTreeItem[]> {
        if (ext.api.status === "LoggedIn") {
            if (!element) {
                return this.loadProjects();
            }
        } else if (ext.api.status === "LoggingIn") {
            return [new ChoreoSignInPendingTreeItem()];
        } else {
            return [];
        }
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    private async loadProjects(): Promise<ChoreoProjectTreeItem[]> {
        const selectedOrg = ext.api.selectedOrg;
        if (selectedOrg) {
            return getProjectsByOrg(selectedOrg.id)
                .then((projects) => {
                    return projects.map((proj) => new ChoreoProjectTreeItem(proj, TreeItemCollapsibleState.Collapsed));
                });
        } else {
            throw Error("Selected organization is not set.");
        }

    }
}
