/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as path from 'path';

export const SAMPLE_ICONS_GITHUB_URL = "https://raw.githubusercontent.com/wso2/integration-studio/main/SamplesForVSCode/icons/";
export const MI_COPILOT_BACKEND_URL = "https://e95488c8-8511-4882-967f-ec3ae2a0f86f-dev.e1-us-east-azure.choreoapis.dev/miaideployments/micopilot/mi-copilot-backend-be2/v1.0";
export const USER_CHECK_BACKEND_URL = '/user/usage';

export const COMMANDS = {
    OPEN_PROJECT: "MI.openProject",
    MIGRATE_PROJECT: "MI.migrateProject",
    SHOW_OVERVIEW: "MI.showOverview",
    DISABLE_OVERVIEW: "MI.disableOverview",
    OPEN_AI_PANEL: "MI.openAiPanel",
    CLEAR_AI_PROMPT: "MI.clearAIPrompt",
    OPEN_WELCOME: "MI.openWelcome",
    SHOW_GRAPHICAL_VIEW: "MI.show.graphical-view",
    SHOW_RESOURCE_VIEW: "MI.show.resource-view",
    SHOW_SEQUENCE_VIEW: "MI.show.sequence-view",
    SHOW_SEQUENCE_TEMPLATE_VIEW: "MI.show.sequence_template-view",
    SHOW_PROXY_VIEW: "MI.show.proxy-view",
    SHOW_TASK: "MI.show.task",
    SHOW_INBOUND_ENDPOINT: "MI.show.inbound-endpoint",
    SHOW_SOURCE: "MI.show.source",
    SHOW_XML: "MI.show.xml",
    SHOW_MESSAGE_PROCESSOR: "MI.show.message-processor",
    SHOW_MESSAGE_STORE: "MI.show.message-store",
    SHOW_LOCAL_ENTRY: "MI.show.local-entry",
    SHOW_CONNECTION: "MI.show.connection",
    SHOW_TEMPLATE: "MI.show.template",
    SHOW_ENDPOINT: "MI.show.endpoint",
    SHOW_DEFAULT_ENDPOINT: "MI.show.default-endpoint",
    SHOW_ADDRESS_ENDPOINT: "MI.show.address-endpoint",
    SHOW_HTTP_ENDPOINT: "MI.show.http-endpoint",
    SHOW_WSDL_ENDPOINT: "MI.show.wsdl-endpoint",
    SHOW_LOAD_BALANCE_ENDPOINT: "MI.show.load-balance-endpoint",
    SHOW_FAILOVER_ENDPOINT: "MI.show.failover-endpoint",
    SHOW_TEMPLATE_ENDPOINT: "MI.show.template-endpoint",
    SHOW_RECIPIENT_ENDPOINT: "MI.show.recipient-endpoint",
    SHOW_DATA_SERVICE: "MI.show.data-service",
    OPEN_DSS_SERVICE_DESIGNER: "MI.project-explorer.open-dss-service-designer",
    ADD_MEDIATOR: "MI.addMediator",
    REFRESH_COMMAND: 'MI.project-explorer.refresh',
    ADD_COMMAND: 'MI.project-explorer.add',
    ADD_API_COMMAND: 'MI.project-explorer.add-api',
    ADD_ENDPOINT_COMMAND: 'MI.project-explorer.add-endpoint',
    ADD_SEQUENCE_COMMAND: 'MI.project-explorer.add-sequence',
    ADD_INBOUND_ENDPOINT_COMMAND: 'MI.project-explorer.add-inbound-endpoint',
    ADD_PROXY_SERVICE_COMMAND: 'MI.project-explorer.add-proxy-service',
    ADD_TASK_COMMAND: 'MI.project-explorer.add-task',
    ADD_LOCAL_ENTRY_COMMAND: 'MI.project-explorer.add-local-entry',
    ADD_CONNECTION_COMMAND: 'MI.project-explorer.add-connection',
    ADD_MESSAGE_PROCESSOR_COMMAND: 'MI.project-explorer.add-message-processor',
    ADD_MESSAGE_STORE_COMMAND: 'MI.project-explorer.add-message-store',
    ADD_TEMPLATE_COMMAND: 'MI.project-explorer.add-template',
    ADD_DATA_SERVICE_COMMAND: 'MI.project-explorer.add-data-service',
    CREATE_PROJECT_COMMAND: 'MI.project-explorer.create-project',
    IMPORT_PROJECT_COMMAND: 'MI.project-explorer.import-project',
    REVEAL_ITEM_COMMAND: 'MI.project-explorer.revealItem',
    FOCUS_PROJECT_EXPLORER: 'MI.project-explorer.focus',
    OPEN_SERVICE_DESIGNER: 'MI.project-explorer.open-service-designer',
    OPEN_PROJECT_OVERVIEW: 'MI.project-explorer.open-project-overview',
    ADD_REGISTERY_RESOURCE_COMMAND: 'MI.project-explorer.add-registry-resource',
    EDIT_REGISTERY_RESOURCE_COMMAND: 'MI.project-explorer.edit-reg-resource',
    EDIT_REGISTRY_RESOURCE_METADATA_COMMAND: 'MI.project-explorer.edit-reg-metadata',
    ADD_CLASS_MEDIATOR_COMMAND: 'MI.project-explorer.add-class-mediator',
    EDIT_CLASS_MEDIATOR_COMMAND: 'MI.project-explorer.edit-class-mediator',
    DELETE_PROJECT_EXPLORER_ITEM: 'MI.project-explorer.delete',
    CHANGE_SERVER_PATH: 'MI.change.server',
    BUILD_PROJECT: 'MI.build-project',
    CREATE_DOCKER_IMAGE: 'MI.create-docker-image',
    BUILD_AND_RUN_PROJECT: 'MI.build-and-run',
    ADD_DATA_SOURCE_COMMAND: 'MI.project-explorer.add-data-source',
    SHOW_DATA_SOURCE: 'MI.show.data-source',
    SHOW_DATA_MAPPER: 'MI.show.data-mapper',
    ADD_TEST_SUITE: 'MI.test.add.suite',
    GEN_AI_TESTS: 'MI.test.gen.ai-test',
    EDIT_TEST_SUITE: 'MI.test.edit.suite',
    ADD_TEST_CASE: 'MI.test.add.case',
    EDIT_TEST_CASE: 'MI.test.edit.case',
    ADD_MOCK_SERVICE: 'MI.test.add.mock-service',
    REFRESH_MOCK_SERVICES: 'MI.test.refresh.mock-services',
    EDIT_MOCK_SERVICE: 'MI.test.edit.mock-service',
    OPEN_RUNTIME_VIEW: 'MI.Open-runtime-service-view',
    REVEAL_TEST_PANE: 'MI.mock-services.focus',
};

export const DEFAULT_PROJECT_VERSION = "1.0.0";

export const REFRESH_ENABLED_DOCUMENTS = ["SynapseXml", "typescript"];

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

// export enum TemplateTypes {
//     INBOUND_ENDPOINT = "INBOUND_ENDPOINT",
//     LOCAL_ENTRY = "LOCAL_ENTRY",
//     MESSAGE_PROCESSOR = "MESSAGE_PROCESSOR",
//     MESSAGE_STORE = "MESSAGE_STORE",
//     SEQUENCE = "SEQUENCE",
//     TASK = "TASK",
//     TEMPLATE = "TEMPLATE",
// };

export * from "./swagger";

export const APIS = {
    CONNECTOR: "https://mi-connectors.wso2.com/icons/mi-connectors-info.json"
}

