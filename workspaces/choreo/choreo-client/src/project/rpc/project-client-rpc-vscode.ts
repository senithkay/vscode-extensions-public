/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { serializeError } from "@wso2-enterprise/choreo-core";
import { Messenger } from "vscode-messenger";
import { IChoreoProjectClient } from "../types";
import { CreateBuildpackComponentRequest, CreateByocComponentRequest, CreateComponentRequest, CreateMiComponentRequest, CreateProjectRequest, DeleteComponentRequest, GetComponentsRequest, GetProjectsRequest, GetRepoMetaDataRequest, LinkRepoRequest } from "./types";

export function registerChoreoProjectRPCHandlers(messenger: Messenger, projectClient: IChoreoProjectClient) {
   messenger.onRequest(GetProjectsRequest, (params) => projectClient.getProjects(params).catch(serializeError));
   messenger.onRequest(GetComponentsRequest, (params) => projectClient.getComponents(params).catch(serializeError));
   messenger.onRequest(GetRepoMetaDataRequest, (params) => projectClient.getRepoMetadata(params).catch(serializeError));
   messenger.onRequest(CreateProjectRequest, (params) => projectClient.createProject(params).catch(serializeError));
   messenger.onRequest(CreateComponentRequest, (params) => projectClient.createComponent(params).catch(serializeError));
   messenger.onRequest(CreateByocComponentRequest, (params) => projectClient.createByocComponent(params).catch(serializeError));
   messenger.onRequest(CreateBuildpackComponentRequest, (params) => projectClient.createBuildPackComponent(params).catch(serializeError));
   messenger.onRequest(CreateMiComponentRequest, (params) => projectClient.createMiComponent(params).catch(serializeError));
   messenger.onRequest(LinkRepoRequest, (params) => projectClient.linkRepo(params).catch(serializeError));
   messenger.onRequest(DeleteComponentRequest, (params) => projectClient.deleteComponent(params).catch(serializeError));
}
