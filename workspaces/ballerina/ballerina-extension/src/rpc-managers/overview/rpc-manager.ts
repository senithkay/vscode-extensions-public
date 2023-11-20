/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
import {
    BallerinaFunctionSTRequest,
    BallerinaProjectComponents,
    BallerinaSTModifyResponse,
    ExecutorPositionsResponse,
    GetBallerinaPackagesParams,
    GetBallerinaProjectParams,
    OverviewAPI
} from "@wso2-enterprise/ballerina-core";
import { workspace } from "vscode";
import { getLangClient } from "../../visualizer/activator";

export class OverviewRpcManager implements OverviewAPI {

    private _langClient = getLangClient();

    async getBallerinaProjectComponents(params: GetBallerinaPackagesParams): Promise<BallerinaProjectComponents> {
        // Check if there is at least one workspace folder
        if (workspace.workspaceFolders?.length) {
            const workspaceFolder = workspace.workspaceFolders[0];
            const workspaceUri = workspaceFolder.uri;

            return this._langClient.getBallerinaProjectComponents({
                documentIdentifiers: [
                    {
                        uri: workspaceUri.toString(),
                    }
                ]
            });
        } else {
            // Handle the case where there are no workspace folders
            throw new Error("No workspace folders are open");
        }
    }

    async getSTForFunction(params: BallerinaFunctionSTRequest): Promise<BallerinaSTModifyResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getExecutorPositions(params: GetBallerinaProjectParams): Promise<ExecutorPositionsResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }
}
