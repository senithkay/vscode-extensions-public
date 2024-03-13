/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export const SAMPLE_ICONS_GITHUB_URL = "https://raw.githubusercontent.com/wso2/integration-studio/main/SamplesForVSCode/icons/";
export const MI_COPILOT_BACKEND_URL = "http://127.0.0.1:8000/code-gen-chat";
// export const MI_COPILOT_BACKEND_URL = "https://cf3a4176-54c9-4547-bcd6-c6fe400ad0d8-dev.e1-us-east-azure.choreoapis.dev/awwr/mi-copilot-backend/mi-copilot-backend-5de/v1.0";

// Service Designer Templates
export const SERVICE_DESIGNER = {
    EDIT_SERVICE: "service-designer-edit-resource",
    ADD_RESOURCE: "service-designer-add-resource",
} as const;

// Default Editor Info
export const TAB_SIZE = 4; // 4 spaces

// Syntax Tree Kinds
export const SYNTAX_TREE_KIND = {
    SEQUENCE: "sequence",
    PROXY: "proxy",
} as const;