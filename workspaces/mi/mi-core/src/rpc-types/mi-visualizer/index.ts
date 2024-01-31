/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { VisualizerLocation } from "../../state-machine-types";
import { ProjectStructureRequest, ProjectStructureResponse, WorkspacesResponse } from "./types";

export interface MIVisualizerAPI {
    getWorkspaces: () => Promise<WorkspacesResponse>;
    getProjectStructure: (params: ProjectStructureRequest) => Promise<ProjectStructureResponse>;
    openView: (params: VisualizerLocation) => void;
    goBack: () => void;
}
