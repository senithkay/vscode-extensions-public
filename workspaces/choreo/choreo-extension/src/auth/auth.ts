/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import * as vscode from 'vscode';
import {
    ChoreoProjectClient,
    IReadOnlyTokenStorage,
    ChoreoSubscriptionClient,
    ComponentManagementClient,
    ChoreoCellViewClient,
    ChoreoDevopsClient
} from "@wso2-enterprise/choreo-client";
import { ChoreoGithubAppClient } from "@wso2-enterprise/choreo-client/lib/github";

import { CHOREO_ENV_CONFIG_DEV, CHOREO_ENV_CONFIG_STAGE, ChoreoEnvConfig, IChoreoEnvConfig, DEFAULT_CHOREO_ENV_CONFIG } from "./config";
import { ext } from '../extensionVariables';
import { getLogger } from '../logger/logger';
import { ChoreoAIConfig } from '../services/ai';
import { Organization, SIGN_IN_FROM_EXISITING_SESSION_FAILURE_EVENT } from '@wso2-enterprise/choreo-core';
import { sendTelemetryEvent } from '../telemetry/utils';
import { workspace } from 'vscode';
import { ChoreoRPCClient } from '../../src/choreo-rpc';

export const CHOREO_AUTH_ERROR_PREFIX = "Choreo Login: ";

export const choreoAIConfig = new ChoreoAIConfig();

// eslint-disable-next-line @typescript-eslint/naming-convention
const choreoEnv = process.env.TEST_CHOREO_EXT_ENV ?? workspace.getConfiguration().get("Advanced.ChoreoEnvironment");

let pickedEnvConfig: IChoreoEnvConfig;

switch (choreoEnv) {
    case 'prod':
        pickedEnvConfig = DEFAULT_CHOREO_ENV_CONFIG;
        break;
    case 'stage':
        pickedEnvConfig = CHOREO_ENV_CONFIG_STAGE;
        break;
    case 'dev':
        pickedEnvConfig = CHOREO_ENV_CONFIG_DEV;
        break;
    default:
        pickedEnvConfig = DEFAULT_CHOREO_ENV_CONFIG;
}

export const choreoEnvConfig: ChoreoEnvConfig = new ChoreoEnvConfig(pickedEnvConfig);

export function activateClients(): void {

    const readonlyTokenStore: IReadOnlyTokenStorage = {
        getToken : async (orgId: number) => {
            if (orgId) {
                return "" as any;
            }
            throw new Error("Organization ID is not provided.");
        }
    };

    const projectClient = new ChoreoProjectClient(
        readonlyTokenStore,
        choreoEnvConfig.getProjectAPI(),
        choreoAIConfig.getPerfAPI(),
        choreoAIConfig.getSwaggerExamplesAPI(),
        choreoEnvConfig.getDeclarativeUrl()
    );

    const githubAppClient = new ChoreoGithubAppClient(
        readonlyTokenStore, choreoEnvConfig.getProjectAPI(), choreoEnvConfig.getGHAppConfig());

    const subscriptionClient = new ChoreoSubscriptionClient(readonlyTokenStore, `${choreoEnvConfig.getBillingUrl()}/api`);

    const componentManagementClient = new ComponentManagementClient(readonlyTokenStore, choreoEnvConfig.getComponentManagementUrl());

    const devopsClient = new ChoreoDevopsClient(readonlyTokenStore, choreoEnvConfig.getDevopsUrl());
    const cellViewClient = new ChoreoCellViewClient(projectClient);

    const rpcClient = new ChoreoRPCClient();

    

    ext.clients = {
        githubAppClient,
        projectClient,
        subscriptionClient,
        componentManagementClient,
        devopsClient,
        cellViewClient,

        rpcClient: rpcClient
    };
}

// todo: remove
// export async function initiateInbuiltAuth() {
//     const callbackUri = await vscode.env.asExternalUri(
//         vscode.Uri.parse(`${vscode.env.uriScheme}://wso2.choreo/signin`)
//     );
//     const oauthURL = await ext.authHandler.getAuthUrl(callbackUri.toString());
//     getLogger().debug("OAuth URL: " + oauthURL);
//     return vscode.env.openExternal(vscode.Uri.parse(oauthURL));
// }



// export async function promptToOpenSignupPage() {
//     // TODO: need to show this when user logging in for the very first time. (Also convert showInformationMessage to modal)
//     const signUpURL = ext.authHandler.getSignUpUrl();
//     await vscode.window.showInformationMessage("Please complete signup in the Choreo Console", "Sign Up").then((selection) => {
//         if (selection === "Sign Up") {
//             return vscode.env.openExternal(vscode.Uri.parse(signUpURL));
//         }
//     });
// }


export function getConsoleUrl() {
    return choreoEnvConfig.getConsoleUrl();
}
