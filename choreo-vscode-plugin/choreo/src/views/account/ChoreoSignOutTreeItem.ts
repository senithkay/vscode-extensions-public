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
import { TreeItem, TreeItemCollapsibleState } from "vscode";
import { choreoSignOutCmdId } from "../../constants";
import { ext } from "../../extensionVariables";
import { getIconPath } from "../../icons";

export class ChoreoSignOutTreeItem extends TreeItem {
    constructor(
    ) {
      super("Sign out from Choreo...", TreeItemCollapsibleState.None);
      this.command = {
        command: choreoSignOutCmdId,
        title: `Sign out ${ext.api.userName ? ext.api.userName : ''} from Choreo`
      };
      this.description = ext.api.userName;
    }
  
    iconPath = {
      light: getIconPath('sign-out', "light"),
      dark: getIconPath('sign-out', "dark")
    };
}