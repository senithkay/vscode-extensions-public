
/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
*
* This software is the property of WSO2 LLC. and its suppliers, if any.
* Dissemination of any information or reproduction of any material contained
* herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
* You may not alter or remove any copyright or other notice from copies of this content.
*/
import { AddToProjectRequest, GetFromFileRequest, DeleteFromProjectRequest, GenerateMappingsRequest, GenerateMappingsResponse, NotifyAIMappingsRequest, ProjectSource, ProjectDiagnostics, GenerateMappingsFromRecordRequest, GenerateMappingFromRecordResponse, PostProcessRequest, PostProcessResponse, GenerateTypesFromRecordRequest, GenerateTypesFromRecordResponse, FetchDataRequest, FetchDataResponse, TestGenerationRequest, TestGenerationResponse, TestGenerationMentions, AIChatSummary, DeveloperDocument, RequirementSpecification, LLMDiagnostics, GetModuleDirParams, AIPanelPrompt, AIMachineSnapshot, SubmitFeedbackRequest } from "./interfaces";

export interface AIPanelAPI {
    // ==================================
    // General Functions
    // ==================================
    getBackendUrl: () => Promise<string>;
    getProjectUuid: () => Promise<string>;
    getAccessToken: () => Promise<string>;
    getRefreshedAccessToken: () => Promise<string>;
    getDefaultPrompt: () => Promise<AIPanelPrompt>;
    getAIMachineSnapshot: () => Promise<AIMachineSnapshot>;
    fetchData: (params: FetchDataRequest) => Promise<FetchDataResponse>;
    addToProject: (params: AddToProjectRequest) => void;
    getFromFile: (params: GetFromFileRequest) => Promise<string>;
    getFileExists: (params: GetFromFileRequest) => Promise<boolean>;
    deleteFromProject: (params: DeleteFromProjectRequest) => void;
    generateMappings: (params: GenerateMappingsRequest) => Promise<GenerateMappingsResponse>;
    notifyAIMappings: (params: NotifyAIMappingsRequest) => Promise<boolean>;
    stopAIMappings: () => Promise<GenerateMappingsResponse>;
    getProjectSource: (params: string) => Promise<ProjectSource>;
    getShadowDiagnostics: (params: ProjectSource) => Promise<ProjectDiagnostics>;
    checkSyntaxError: (params: ProjectSource) => Promise<boolean>;
    clearInitialPrompt: () => void;
    // Test-generator related functions
    getGeneratedTests: (params: TestGenerationRequest) => Promise<TestGenerationResponse>;
    getTestDiagnostics: (params: TestGenerationResponse) => Promise<ProjectDiagnostics>;
    getServiceSourceForName: (params: string) => Promise<string>;
    getResourceSourceForMethodAndPath: (params: string) => Promise<string>;
    getServiceNames: () => Promise<TestGenerationMentions>;
    getResourceMethodAndPaths: () => Promise<TestGenerationMentions>;
    abortTestGeneration: () => void;
    getMappingsFromRecord: (params: GenerateMappingsFromRecordRequest) => Promise<GenerateMappingFromRecordResponse>;
    getTypesFromRecord: (params: GenerateTypesFromRecordRequest) => Promise<GenerateTypesFromRecordResponse>;
    applyDoOnFailBlocks: () => void;
    postProcess: (params: PostProcessRequest) => Promise<PostProcessResponse>;
    getActiveFile:() => Promise<string>;
    promptGithubAuthorize: () => Promise<boolean>;
    promptWSO2AILogout: () => Promise<boolean>;
    isCopilotSignedIn: () => Promise<boolean>;
    showSignInAlert: () => Promise<boolean>;
    markAlertShown: () => void;
    getFromDocumentation: (params: string) => Promise<string>;
    isRequirementsSpecificationFileExist:(params: string) => Promise<boolean>;
    getDriftDiagnosticContents:(params: string) => Promise<LLMDiagnostics>;
    addChatSummary:(params: AIChatSummary) => Promise<boolean>;
    handleChatSummaryError:(params: string) => void;
    isNaturalProgrammingDirectoryExists:(params: string) => Promise<boolean>;
    readDeveloperMdFile:(params: string) => Promise<string>;
    updateDevelopmentDocument:(params: DeveloperDocument) => void;
    updateRequirementSpecification:(params: RequirementSpecification) => void;
    createTestDirecoryIfNotExists:(params: string) => void;
    getModuleDirectory:(params: GetModuleDirParams) => Promise<string>;
    getContentFromFile: (params: GetFromFileRequest) => Promise<string>;
    submitFeedback: (params: SubmitFeedbackRequest) => Promise<boolean>;
}
