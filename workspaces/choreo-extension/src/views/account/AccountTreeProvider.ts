/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
import { reject } from "lodash";
import { EventEmitter, ProviderResult, TreeDataProvider, TreeItem, TreeItemCollapsibleState, Uri } from "vscode";
import { ext } from "../../extensionVariables";
import { ChoreoSignInPendingTreeItem } from "../common/ChoreoSignInTreeItem";
import { ChoreoSignInTreeItem } from "./ChoreoSignInTreeItem";
import { ChoreoSignOutTreeItem } from "./ChoreoSignOutTreeItem";
import { ChoreoOrgTreeItem } from "./ChoreoOrganizationTreeItem";
import { ChoreoOrganizationsTreeItem } from "./ChoreoOrganizationsTreeItem";
import { orgClient } from "../../auth/auth";
import { getLogger } from "../../logger/logger";
import { STATUS_LOGGED_IN, STATUS_LOGGED_OUT, STATUS_LOGGING_IN } from "../../constants";
import { executeWithTaskRetryPrompt } from "../../retry";
import { ChoreoSwitchAccountTreeItem } from "./ChoreoSwitchAccountTreeItem";

export type AccountTreeItem = ChoreoSignOutTreeItem | ChoreoOrgTreeItem | ChoreoSignInTreeItem | ChoreoSignInPendingTreeItem;
 
 export class AccountTreeProvider implements TreeDataProvider<AccountTreeItem> {

    private _onDidChangeTreeData = new EventEmitter<AccountTreeItem | undefined | void >();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor() {
        ext.context.subscriptions.push(ext.api.onStatusChanged(() => {
            this.refresh();
        }));
        ext.context.subscriptions.push(ext.api.onOrganizationChanged(() => {
            this.refresh();
        }));
    }

     getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
         return element;
     }
 
     getChildren(element?: TreeItem): ProviderResult<AccountTreeItem[]> {
        if (ext.api.status === STATUS_LOGGED_IN) {
            if (!element) {
                return  [new ChoreoOrganizationsTreeItem(), new ChoreoSwitchAccountTreeItem(), new ChoreoSignOutTreeItem()];
            } else if (element instanceof ChoreoOrganizationsTreeItem) {
                return this.loadOrgTree();
            }
        } else if (ext.api.status === STATUS_LOGGED_OUT) {
            return [new ChoreoSignInTreeItem()];
        } else if (ext.api.status === STATUS_LOGGING_IN) {
            return [new ChoreoSignInPendingTreeItem()];
        }
     }
 
     refresh(treeItem?: AccountTreeItem): void {
        this._onDidChangeTreeData.fire(treeItem);
     }

     private async loadOrgTree(): Promise<ChoreoOrgTreeItem[]> {
         getLogger().debug("Loading organizations of the user.");
         const loginSuccess = await ext.api.waitForLogin();
         if (loginSuccess) {
             try {
                 const userInfo = await executeWithTaskRetryPrompt(() => orgClient.getUserInfo());
                 if (userInfo.organizations && userInfo.organizations.length > 0) {
                     const treeItems: ChoreoOrgTreeItem[] = userInfo.organizations.map<ChoreoOrgTreeItem>((org) => new ChoreoOrgTreeItem(userInfo.userId, org, TreeItemCollapsibleState.None));
                     return treeItems;
                 }
             } catch (error: any) {
                getLogger().error("Error while loading organizations of the user." + error?.message + (error?.cause ? "\nCause: " + error.cause.message : ""));
             }
         }
         return [];
     }
 }
 