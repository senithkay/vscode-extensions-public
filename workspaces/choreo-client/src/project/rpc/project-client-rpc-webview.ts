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
import { Project, Component, Repository } from "@wso2-enterprise/choreo-core";
import { HOST_EXTENSION } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";
import { ComponentMutationParams, CreateProjectParams, GetComponentsParams, GetProjectsParams, IChoreoProjectClient, LinkRepoMutationParams } from "../types";
import { CreateComponentRequest, CreateProjectRequest, GetComponentsRequest, GetProjectsRequest, LinkRepoRequest } from "./types";

export class ChoreoProjectClientRPCWebView implements IChoreoProjectClient {

    constructor(private _messenger: Messenger) {
    }

    getProjects(params: GetProjectsParams): Promise<Project[]> {
        return this._messenger.sendRequest(GetProjectsRequest, HOST_EXTENSION, params);
    }
    getComponents(params: GetComponentsParams): Promise<Component[]> {
        return this._messenger.sendRequest(GetComponentsRequest, HOST_EXTENSION, params);
    }
    createProject(params: CreateProjectParams): Promise<Project> {
        return this._messenger.sendRequest(CreateProjectRequest, HOST_EXTENSION, params);
    }
    createComponent(params: ComponentMutationParams): Promise<Component> {
        return this._messenger.sendRequest(CreateComponentRequest, HOST_EXTENSION, params);
    }
    linkRepo(params: LinkRepoMutationParams): Promise<Repository> {
        return this._messenger.sendRequest(LinkRepoRequest, HOST_EXTENSION, params);
    }
    getDiagramModel(params: GetComponentsParams): Promise<Component[]> {
        return this._messenger.sendRequest(GetComponentsRequest, HOST_EXTENSION, params);
    }
}
