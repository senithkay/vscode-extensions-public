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
import { Organization } from "@wso2-enterprise/choreo-core";
import { ext } from "../../extensionVariables";

export class ChoreoOrgTreeItem extends TreeItem {
    constructor(
      public readonly org: Organization,
      public readonly collapsibleState: TreeItemCollapsibleState
    ) {
      super(org.name, collapsibleState);
      const isSelected = ext.api.selectedOrg?.id === org.id;
      this.description = isSelected ? '*' : '';
      this.tooltip = `Organization handle: ${org.handle}\nOwner: ${org.owner.id}`;
      this.contextValue = "choreo.org";
    }
  
    iconPath = new ThemeIcon("organization");
}