
/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
*
* This software is the property of WSO2 LLC. and its suppliers, if any.
* Dissemination of any information or reproduction of any material contained
* herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
* You may not alter or remove any copyright or other notice from copies of this content.
*/
import { AIVisualizerState, AddToProjectRequest, GetFromFileRequest, DeleteFromProjectRequest, GenerateMappingsRequest, GenerateMappingsResponse, NotifyAIMappingsRequest, ProjectSource, ProjectDiagnostics, InitialPrompt, GenerateTestRequest, GeneratedTestSource, GenerateMappingsFromRecordRequest, GenerateMappingFromRecordResponse, PostProcessRequest, PostProcessResponse, GenerateTypesFromRecordRequest, GenerateTypesFromRecordResponse } from "./interfaces";

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
    getFromFile: (content: GetFromFileRequest) => Promise<string>;
    getFileExists: (content: GetFromFileRequest) => Promise<boolean>;
    deleteFromProject: (content: DeleteFromProjectRequest) => void;
    getRefreshToken: () => Promise<string>;
    generateMappings: (params: GenerateMappingsRequest) => Promise<GenerateMappingsResponse>;
    notifyAIMappings: (params: NotifyAIMappingsRequest) => Promise<boolean>;
    stopAIMappings: () => Promise<GenerateMappingsResponse>;
    promptLogin: () => Promise<boolean>;
    getProjectSource: () => Promise<ProjectSource>;
    getShadowDiagnostics: (project: ProjectSource) => Promise<ProjectDiagnostics>;
    checkSyntaxError: (project: ProjectSource) => Promise<boolean>;
    getInitialPrompt: () => Promise<InitialPrompt>;
    clearInitialPrompt: () => void;
    // Test-generator related functions
    getGeneratedTest: (params: GenerateTestRequest) => Promise<GeneratedTestSource>;
    getTestDiagnostics: (params: GeneratedTestSource) => Promise<ProjectDiagnostics>;
    getMappingsFromRecord: (params: GenerateMappingsFromRecordRequest) => Promise<GenerateMappingFromRecordResponse>;
    getTypesFromRecord: (params: GenerateTypesFromRecordRequest) => Promise<GenerateTypesFromRecordResponse>;
    applyDoOnFailBlocks: () => void;
    postProcess: (req: PostProcessRequest) => Promise<PostProcessResponse>;
    getActiveFile:() => Promise<string>;
    openSettings: () => void;
    openChat: () => void;
    promptGithubAuthorize: () => Promise<boolean>;
    promptWSO2AILogout: () => Promise<boolean>;
    isCopilotSignedIn: () => Promise<boolean>;
    isWSO2AISignedIn: () => Promise<boolean>;
    showSignInAlert: () => Promise<boolean>;
    markAlertShown: () => void;
    getFromDocumentation: (content: string) => Promise<string>;
}
