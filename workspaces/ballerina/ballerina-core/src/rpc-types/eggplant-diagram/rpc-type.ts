/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
import { Flow, ProjectStructureResponse } from "../../interfaces/eggplant";
import { EggplantModelResponse, UpdateNodeRequest } from "../../interfaces/extended-lang-client";
import { CreateComponentRequest, CreateComponentResponse, CreateProjectRequest, ProjectComponentsResponse, WorkspacesResponse } from "./interfaces";
import { RequestType, NotificationType } from "vscode-messenger-common";

const _preFix = "eggplant-diagram";
export const getEggplantModel: RequestType<void, EggplantModelResponse> = { method: `${_preFix}/getEggplantModel` };
export const updateEggplantModel: NotificationType<Flow> = { method: `${_preFix}/updateEggplantModel` };
export const updateNode: NotificationType<UpdateNodeRequest> = { method: `${_preFix}/updateNode` };
export const createProject: NotificationType<CreateProjectRequest> = { method: `${_preFix}/createProject` };
export const getWorkspaces: RequestType<void, WorkspacesResponse> = { method: `${_preFix}/getWorkspaces` };
export const getProjectStructure: RequestType<void, ProjectStructureResponse> = { method: `${_preFix}/getProjectStructure` };
export const getProjectComponents: RequestType<void, ProjectComponentsResponse> = { method: `${_preFix}/getProjectComponents` };
export const createComponent: RequestType<CreateComponentRequest, CreateComponentResponse> = { method: `${_preFix}/createComponent` };
