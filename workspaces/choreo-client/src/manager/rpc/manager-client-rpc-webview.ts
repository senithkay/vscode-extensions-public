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
import { ChoreoComponentCreationParams, Component, IProjectManager, IsRepoClonedRequestParams, Project } from "@wso2-enterprise/choreo-core";
import { HOST_EXTENSION } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";
import { CreateLocalComponentRequest, IsRepoClonedRequest } from "./types";

export class ChoreoProjectManagerRPCWebview implements IProjectManager {
    constructor (private _messenger: Messenger) {

    }
    isRepoCloned(params: IsRepoClonedRequestParams): Promise<boolean> {
        return this._messenger.sendRequest(IsRepoClonedRequest, HOST_EXTENSION, params);
    }
    createLocalComponent(args: ChoreoComponentCreationParams): Promise<string | boolean> {
        return this._messenger.sendRequest(CreateLocalComponentRequest, HOST_EXTENSION, args);
    }
    getProjectDetails(): Promise<Project> {
        throw new Error("Method not implemented.");
    }
    getProjectRoot(): Promise<string | undefined> {
        throw new Error("Method not implemented.");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getLocalComponents(_workspaceFilePath: string): Component[] {
        throw new Error("Method not implemented.");
    }
}
