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
import { Messenger } from "vscode-messenger";
import { IChoreoProjectClient } from "../types";
import { CreateComponentRequest, CreateProjectRequest, GetComponentsRequest, GetProjectsRequest, LinkRepoRequest } from "./types";

export function registerChoreoProjectRPCHandlers(messenger: Messenger, projectClient: IChoreoProjectClient) {
   messenger.onRequest(GetProjectsRequest, (params) => projectClient.getProjects(params));
   messenger.onRequest(GetComponentsRequest, (params) => projectClient.getComponents(params));
   messenger.onRequest(CreateProjectRequest, (params) => projectClient.createProject(params));
   messenger.onRequest(CreateComponentRequest, (params) => projectClient.createComponent(params));
   messenger.onRequest(LinkRepoRequest, (params) => projectClient.linkRepo(params));
}
