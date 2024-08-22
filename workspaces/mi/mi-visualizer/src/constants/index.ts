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
export const MI_UNIT_TEST_GENERATION_BACKEND_URL = `/unit-test/generate`;

// MI Copilot Error Messages
export const COPILOT_ERROR_MESSAGES = {
    BAD_REQUEST: 'Bad Request',
    UNAUTHORIZED: 'Unauthorized',
    FORBIDDEN: 'Forbidden',
    NOT_FOUND: 'Not Found',
    TOKEN_COUNT_EXCEEDED: 'Token Count Exceeded',
    ERROR_422: "Something went wrong. Please clear the chat and try again.",
};


// Default Editor Info
export const TAB_SIZE = 4; // 4 spaces

// Syntax Tree Kinds
export const SYNTAX_TREE_KIND = {
    SEQUENCE: "sequence",
    PROXY: "proxy",
} as const;

// Diagram view
export const SIDE_PANEL_WIDTH = 450;

export const gitIssueUrl = "https://github.com/wso2/mi-vscode/issues";

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

export enum EndpointTypes {
    DEFAULT_ENDPOINT = "DEFAULT_ENDPOINT",
    ADDRESS_ENDPOINT = "ADDRESS_ENDPOINT",
    HTTP_ENDPOINT = "HTTP_ENDPOINT",
    WSDL_ENDPOINT = "WSDL_ENDPOINT",
    LOAD_BALANCE_ENDPOINT = "LOAD_BALANCE_ENDPOINT",
    FAILOVER_ENDPOINT = "FAILOVER_ENDPOINT",
    TEMPLATE_ENDPOINT = "TEMPLATE_ENDPOINT",
    RECIPIENT_ENDPOINT = "RECIPIENT_ENDPOINT",
};

export enum TemplateTypes {
    DEFAULT_ENDPOINT = "DEFAULT_ENDPOINT",
    ADDRESS_ENDPOINT = "ADDRESS_ENDPOINT",
    HTTP_ENDPOINT = "HTTP_ENDPOINT",
    WSDL_ENDPOINT = "WSDL_ENDPOINT",
    SEQUENCE_ENDPOINT = "SEQUENCE"
};

export enum MessageProcessorTypes {
    MESSAGE_SAMPLING = "MESSAGE_SAMPLING",
    SCHEDULED_MESSAGE_FORWARDING = "SCHEDULED_MESSAGE_FORWARDING",
    SCHEDULED_FAILOVER_MESSAGE_FORWARDING = "SCHEDULED_FAILOVER_MESSAGE_FORWARDING",
    CUSTOM = "CUSTOM"
};

export enum MessageStoreTypes {
    IN_MEMORY = "IN_MEMORY",
    CUSTOM = "CUSTOM",
    JMS = "JMS",
    RABBITMQ = "RABBITMQ",
    WSO2_MB = "WSO2_MB",
    RESEQUENCE = "RESEQUENCE",
    JDBC = "JDBC"
};

export enum InboundEndpointTypes {
    CXF_WS_RM = "CXF_WS_RM",
    FILE = "FILE",
    HL7 = "HL7",
    JMS = "JMS",
    MQTT = "MQTT",
    WS = "WS",
    FEED = "Feed",
    HTTPS = "HTTPS",
    HTTP = "HTTP",
    KAFKA = "KAFKA",
    WSS = "WSS",
    CUSTOM = "CUSTOM",
    RABBITMQ = "rabbit-mq"
};
export const APIS = {
    CONNECTOR: "https://apis.wso2.com/connector-store/connector-details"
}
