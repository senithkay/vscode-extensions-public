/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NodePosition } from "../../interfaces/ballerina";
import { CompletionResponse } from "../lang-server/interfaces";

export interface TypeResponse {
    data: CompletionResponse;
}

export interface GoToSourceRequest {
    position: NodePosition;
}

export interface UpdateSourceRequest {
    position: NodePosition;
    source: string;
}

export interface UpdateSourceResponse {
    error?: string;
}

export interface DeleteSourceRequest {
    position: NodePosition;
}

export interface DeleteSourceResponse {
    error?: string;
}

export interface WorkspaceFileRequest {
    glob?: string;
}

export interface File {
    relativePath: string;
    path: string;
}


export interface WorkspacesFileResponse {
    workspaceRoot: string;
    files: File[];
}
