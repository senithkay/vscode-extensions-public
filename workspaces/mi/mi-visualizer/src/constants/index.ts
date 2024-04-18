/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

//add the rpc client to the context

export const SAMPLE_ICONS_GITHUB_URL = "https://raw.githubusercontent.com/wso2/integration-studio/main/SamplesForVSCode/icons/";

export const MI_COPILOT_BACKEND_URL = `/chat/copilot`;
export const MI_ARTIFACT_GENERATION_BACKEND_URL = `/chat/artifact-generation`;
export const MI_ARTIFACT_EDIT_BACKEND_URL = `/chat/artifact-editing`;
export const MI_SUGGESTIVE_QUESTIONS_INITIAL_BACKEND_URL = `/suggestions/initial`;
export const MI_SUGGESTIVE_QUESTIONS_BACKEND_URL = `/suggestions`;


// Default Editor Info
export const TAB_SIZE = 4; // 4 spaces

// Syntax Tree Kinds
export const SYNTAX_TREE_KIND = {
    SEQUENCE: "sequence",
    PROXY: "proxy",
} as const;

// Diagram view
export const SIDE_PANEL_WIDTH = 450;

// Actions for service designer
export const SERVICE = {
    EDIT_SERVICE: "edit-service",
    ADD_RESOURCE: "add-resource",
    EDIT_RESOURCE: "edit-resource",
    EDIT_SEQUENCE: "edit-sequence",
    EDIT_PROXY: "edit-proxy",
} as const;

