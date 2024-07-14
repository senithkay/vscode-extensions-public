/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

//add the rpc client to the context

export const SAMPLE_ICONS_GITHUB_URL = "https://mi-connectors.wso2.com/samples/icons/";

export const MI_COPILOT_BACKEND_URL = `/chat/copilot`;
export const MI_ARTIFACT_GENERATION_BACKEND_URL = `/chat/artifact-generation`;
export const MI_ARTIFACT_EDIT_BACKEND_URL = `/chat/artifact-editing`;
export const MI_SUGGESTIVE_QUESTIONS_INITIAL_BACKEND_URL = `/suggestions/initial`;
export const MI_SUGGESTIVE_QUESTIONS_BACKEND_URL = `/suggestions`;
export const MI_UNIT_TEST_GENERATION_BACKEND_URL = `/unit-tests`;


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
export const ARTIFACT_TEMPLATES = {
    ADD_API: "add-api",
    EDIT_API: "edit-api",
    ADD_RESOURCE: "add-resource",
    EDIT_RESOURCE: "edit-resource",
    EDIT_SEQUENCE: "edit-sequence",
    EDIT_HANDLERS: "edit-handlers",
    EDIT_PROXY: "edit-proxy",
} as const;

export const DSS_TEMPLATES = {
    ADD_RESOURCE: "add-dss-resource",
    EDIT_RESOURCE: "edit-dss-resource",
    ADD_OPERATION: "add-dss-operation",
    EDIT_OPERATION: "edit-dss-operation",
    EDIT_DESCRIPTION: "edit-dss-description",
    ADD_QUERY: "add-dss-query",
} as const;

export const ICON_COLORS = {
    API_RESOURCE: "#EB8A44",
    PROXY: "#8EBA43",
    CLASS: "#C7DB00",
    DATA_SERVICE: "#97B8C2",
    DATA_SOURCE: "#FFBEBD",
    DATA_MAPPER: "#F78B2D",
    ENDPOINT: "#F9DC24",
    FILE: "#000",
    FOLD_DOWN: "#000",
    INBOUND_ENDPOINT: "#FFBEBD",
    LOCAL_ENTRY: "#BF9A77",
    MESSAGE_PROCESSOR: "#8313a8",
    MESSAGE_STORE: "#337BAE",
    PROJECT: "#336B87",
    REGISTRY: "#E4B600",
    SEQUENCE: "#4B7447",
    TASK: "#D35C37",
    TEMPLATE: "#D6C6B9",
};
