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
import { ChoreoComponentCreationParams, Component, IProjectManager, IsRepoClonedRequestParams, Project, PushedComponent, RepoCloneRequestParams } from "@wso2-enterprise/choreo-core";
import { HOST_EXTENSION } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";
import { CloneRepoRequeset, CreateLocalBalComponentFromExistingSourceRequest, CreateLocalComponentRequest, GetBallerinaVersion, GetRepoPathRequest, IsComponentNameAvailableRequest, IsRepoClonedRequest } from "./types";

export class ChoreoProjectManagerRPCWebview implements IProjectManager {
    constructor (private _messenger: Messenger) {

    }

    isComponentNameAvailable(componentName: string): Promise<boolean> {
        return this._messenger.sendRequest(IsComponentNameAvailableRequest, HOST_EXTENSION, componentName);
    }
    cloneRepo(params: RepoCloneRequestParams): Promise<boolean> {
        return this._messenger.sendRequest(CloneRepoRequeset, HOST_EXTENSION, params);
    }
    isRepoCloned(params: IsRepoClonedRequestParams): Promise<boolean> {
        return this._messenger.sendRequest(IsRepoClonedRequest, HOST_EXTENSION, params);
    }
    getRepoPath(repository: string): Promise<string> {
        return this._messenger.sendRequest(GetRepoPathRequest, HOST_EXTENSION, repository);
    }
    createLocalComponent(args: ChoreoComponentCreationParams): Promise<string | boolean> {
        return this._messenger.sendRequest(CreateLocalComponentRequest, HOST_EXTENSION, args);
    }
    createLocalBalComponentFromExistingSource(args: ChoreoComponentCreationParams): Promise<string | boolean> {
        return this._messenger.sendRequest(CreateLocalBalComponentFromExistingSourceRequest, HOST_EXTENSION, args);
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getPushedComponents(_workspaceFilePath: string): PushedComponent[] {
        throw new Error("Method not implemented.");
    }
    getBalVersion(): Promise<string> {
        return this._messenger.sendRequest(GetBallerinaVersion, HOST_EXTENSION, "");
    }
}
