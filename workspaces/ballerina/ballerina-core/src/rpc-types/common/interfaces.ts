/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Diagnostic } from "vscode-languageserver-types";
import { Completion } from "../../interfaces/extended-lang-client";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

export interface TypeResponse {
    data: Completion[];
}

export interface GoToSourceRequest {
    position: NodePosition;
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
export interface BallerinaDiagnosticsRequest {
    ballerinaSource: string;
    targetPosition: NodePosition;
    skipSemiColon?: boolean;
    checkSeverity?: 1 | 2 | 3
}
export interface BallerinaDiagnosticsResponse {
    diagnostics: Diagnostic[];
}

export interface CommandsRequest {
    commands: any[];
}

export interface CommandsResponse {
    data: string;
}

export interface ProjectDirResponse {
    path: string;
}
