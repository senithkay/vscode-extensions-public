
/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
*
* This software is the property of WSO2 LLC. and its suppliers, if any.
* Dissemination of any information or reproduction of any material contained
* herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
* You may not alter or remove any copyright or other notice from copies of this content.
*/
import { AIVisualizerState, AddToProjectRequest, GenerateMappingsRequest, GenerateMappingsResponse, NotifyAIMappingsRequest, ProjectSource, ProjectDiagnostics } from "./interfaces";

export interface AIPanelAPI {
    getBackendURL: () => Promise<string>;
    updateProject: () => void;
    login: () => void;
    logout: () => void;
    getAiPanelState: () => Promise<AIVisualizerState>;
    getAccessToken: () => Promise<string>;
    refreshAccessToken: () => void;
    getProjectUuid: () => Promise<string>;
    addToProject: (content: AddToProjectRequest) => void;
    getRefreshToken: () => Promise<string>;
    generateMappings: (params: GenerateMappingsRequest) => Promise<GenerateMappingsResponse>;
    notifyAIMappings: (params: NotifyAIMappingsRequest) => Promise<boolean>;
    stopAIMappings: () => Promise<GenerateMappingsResponse>;
    promptLogin: () => Promise<boolean>;
    getProjectSource: () => Promise<ProjectSource>;
    getShadowDiagnostics: (project: ProjectSource) => Promise<ProjectDiagnostics>;
}
