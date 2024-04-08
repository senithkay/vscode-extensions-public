/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ExtensionContext, StatusBarItem } from "vscode";
import { ChoreoExtensionApi } from "./ChoreoExtensionApi";
// import { RpcApi } from "./RpcApi";

import { ChoreoProjectClient, ChoreoSubscriptionClient, ComponentManagementClient, ChoreoCellViewClient, ChoreoDevopsClient } from "@wso2-enterprise/choreo-client";
import { ChoreoGithubAppClient } from "@wso2-enterprise/choreo-client/lib/github";
import { ChoreoRPCClient } from "./choreo-rpc";

export class ExtensionVariables {
    public context!: ExtensionContext;
    public isPluginStartup!: boolean;
    public api!: ChoreoExtensionApi;
    public statusBarItem!: StatusBarItem;    

    public clients!: {
        projectClient: ChoreoProjectClient,
        githubAppClient: ChoreoGithubAppClient,
        subscriptionClient: ChoreoSubscriptionClient,
        componentManagementClient: ComponentManagementClient,
        devopsClient: ChoreoDevopsClient,
        cellViewClient: ChoreoCellViewClient,

        rpcClient:ChoreoRPCClient
    };
}

export const ext = new ExtensionVariables();
