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
import {
    GoToSourceRequest,
    TypeResponse,
    WorkspaceFileRequest,
    WorkspacesFileResponse
} from "./interfaces";
import { RequestType, NotificationType } from "vscode-messenger-common";

const _preFix = "common";
export const getTypes: RequestType<void, TypeResponse> = { method: `${_preFix}/getTypes` };
export const goToSource: NotificationType<GoToSourceRequest> = { method: `${_preFix}/goToSource` };
export const getWorkspaceFiles: RequestType<WorkspaceFileRequest, WorkspacesFileResponse> = { method: `${_preFix}/getWorkspaceFiles` };
