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
import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from "vscode";
import { Component, ComponentDetailed } from "@wso2-enterprise/choreo-core";

export class ChoreoComponentTreeItem extends TreeItem {

    public detailedComponent: ComponentDetailed | undefined;

    constructor(
      public readonly component: Component
    ) {
      super(component.displayName, TreeItemCollapsibleState.None);
      this.tooltip = component.description;
      const { repository, createdAt, version, displayType } = component;
			const { isUserManage, organizationApp, nameApp } = repository;
      this.description = version;
      this.tooltip = 
        `${isUserManage ? '' : 'Choreo managed component\n'}Type: ${displayType}\nRepository: ${organizationApp}/${nameApp}\nCreated At: ${new Date(createdAt)}`;
      this.contextValue = "choreo.component";
    }
    iconPath = new ThemeIcon(this.component.displayType === "restAPI" ? "globe" : "package");
}