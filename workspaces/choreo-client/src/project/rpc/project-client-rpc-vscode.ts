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
import { serializeError } from "@wso2-enterprise/choreo-core";
import { Messenger } from "vscode-messenger";
import { IChoreoProjectClient } from "../types";
import { CreateByocComponentRequest, CreateComponentRequest, CreateProjectRequest, DeleteComponentRequest, GetComponentsRequest, GetProjectsRequest, GetRepoMetaDataRequest, LinkRepoRequest } from "./types";

export function registerChoreoProjectRPCHandlers(messenger: Messenger, projectClient: IChoreoProjectClient) {
   messenger.onRequest(GetProjectsRequest, (params) => projectClient.getProjects(params).catch(serializeError));
   messenger.onRequest(GetComponentsRequest, (params) => projectClient.getComponents(params).catch(serializeError));
   messenger.onRequest(GetRepoMetaDataRequest, (params) => projectClient.getRepoMetadata(params).catch(serializeError));
   messenger.onRequest(CreateProjectRequest, (params) => projectClient.createProject(params).catch(serializeError));
   messenger.onRequest(CreateComponentRequest, (params) => projectClient.createComponent(params).catch(serializeError));
   messenger.onRequest(CreateByocComponentRequest, (params) => projectClient.createByocComponent(params).catch(serializeError));
   messenger.onRequest(LinkRepoRequest, (params) => projectClient.linkRepo(params).catch(serializeError));
   messenger.onRequest(DeleteComponentRequest, (params) => projectClient.deleteComponent(params).catch(serializeError));
}
