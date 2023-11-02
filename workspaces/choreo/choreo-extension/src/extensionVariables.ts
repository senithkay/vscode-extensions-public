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
import { ExtensionContext, StatusBarItem } from "vscode";
import { ChoreoExtensionApi } from "./ChoreoExtensionApi";
import { ChoreoProjectClient, ChoreoSubscriptionClient, ComponentManagementClient, ChoreoCellViewClient, ChoreoDevopsClient } from "@wso2-enterprise/choreo-client";
import { ChoreoGithubAppClient } from "@wso2-enterprise/choreo-client/lib/github";
import { AuthHandler } from "./auth/AuthHandler";

export class ExtensionVariables {
    public context!: ExtensionContext;
    public isPluginStartup!: boolean;
    public api!: ChoreoExtensionApi;
    public statusBarItem!: StatusBarItem;
    public authHandler!: AuthHandler;

    public clients!: {
        projectClient: ChoreoProjectClient,
        githubAppClient: ChoreoGithubAppClient,
        subscriptionClient: ChoreoSubscriptionClient,
        componentManagementClient: ComponentManagementClient,
        devopsClient: ChoreoDevopsClient,
        cellViewClient: ChoreoCellViewClient
    };
}

export const ext = new ExtensionVariables();
