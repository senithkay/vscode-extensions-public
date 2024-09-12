/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DIRECTORY_MAP } from "../../interfaces/eggplant";
import { BallerinaProjectComponents } from "../../interfaces/extended-lang-client";

export interface CreateProjectRequest {
    projectName: string;
    projectPath: string;
    isService: boolean;
}

export interface WorkspacesResponse {
    workspaces: WorkspaceFolder[];
}

export interface WorkspaceFolder {
    index: number;
    name: string;
    fsPath: string;
}

export interface CreateComponentRequest {
    type: DIRECTORY_MAP;
    name: string;
    path: string;
    port: string;
}

export interface CreateComponentResponse {
    response: boolean,
}

export interface ProjectComponentsResponse {
    components: BallerinaProjectComponents
}

export interface SetOverviewRequest {
    content: string;
}

export interface SetOverviewResponse {
    content: string;
}
