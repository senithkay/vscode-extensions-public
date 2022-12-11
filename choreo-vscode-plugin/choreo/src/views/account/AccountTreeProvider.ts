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
import { reject } from "lodash";
import { EventEmitter, ProviderResult, TreeDataProvider, TreeItem, TreeItemCollapsibleState, Uri } from "vscode";
import { getProjectsByOrg } from "../../api/queries";
import { getUserInfo } from "../../api/user";
import { ext } from "../../extensionVariables";
import { ChoreoSignInPendingTreeItem } from "../common/ChoreoSignInTreeItem";
import { ChoreoSignInTreeItem } from "./ChoreoSignInTreeItem";
import { ChoreoSignOutTreeItem } from "./ChoreoSignOutTreeItem";
import { ChoreoOrgTreeItem } from "./OrganizationTreeItem";

export type AccountTreeItem = ChoreoSignOutTreeItem | ChoreoOrgTreeItem | ChoreoSignInTreeItem | ChoreoSignInPendingTreeItem;
 
 export class AccountTreeProvider implements TreeDataProvider<AccountTreeItem> {

    private _onDidChangeTreeData = new EventEmitter<AccountTreeItem | undefined | void >();
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
 
     getChildren(element?: TreeItem): ProviderResult<AccountTreeItem[]> {
        if (ext.api.status === "LoggedIn") {
            const treeItems = [new ChoreoSignOutTreeItem()];
            if (!element) {
                // treeItems.push(this.loadOrgTree());
            } 
            return treeItems;
        } else if (ext.api.status === "LoggedOut") {
            return [new ChoreoSignInTreeItem()];
        } else if (ext.api.status === "LoggingIn") {
            return [new ChoreoSignInPendingTreeItem()];
        }
     }
 
     refresh(): void {
        this._onDidChangeTreeData.fire();
     }

     private async loadOrgTree(): Promise<ChoreoOrgTreeItem[]> {
        return new Promise(async (resolve) => {
            const loginSuccess = await ext.api.waitForLogin();
            if (loginSuccess) {
                 const userInfo = await getUserInfo();
                 if (userInfo.organizations && userInfo.organizations.length > 0) {
                     const treeItems: ChoreoOrgTreeItem[] = userInfo.organizations.map<ChoreoOrgTreeItem>((org) => new ChoreoOrgTreeItem(org, TreeItemCollapsibleState.Collapsed));
                     resolve(treeItems);
                     return;
                 }
            } 
            reject("Cannot fetch organizations of the user.");
         });
     }
 }
 