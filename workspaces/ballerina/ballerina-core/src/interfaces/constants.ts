/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export enum SHARED_COMMANDS {
    SHOW_VISUALIZER = 'kolab.show.visualizer',
    OPEN_BI_WELCOME = 'kolab.open.bi.welcome',
    OPEN_SERVICE_FORM = 'kolab.open.service.form',
    OPEN_AI_PANEL = 'kolab.open.ai.panel',
    CLEAR_AI_PROMPT = 'kolab.clear.ai.prompt',
}


export const BI_COMMANDS = {
    BI_RUN_PROJECT: 'BI.project.run',
    REFRESH_COMMAND: 'BI.project-explorer.refresh',
    FOCUS_PROJECT_EXPLORER: 'BI.project-explorer.focus',
    PROJECT_EXPLORER: 'BI.project-explorer',
    ADD_CONNECTIONS: 'BI.project-explorer.add-connection',
    DELETE_COMPONENT: 'BI.project-explorer.delete',
    ADD_ENTRY_POINT: 'BI.project-explorer.add-entry-point',
    ADD_TYPE: 'BI.project-explorer.add-type',
    ADD_FUNCTION: 'BI.project-explorer.add-function',
    OPEN_TYPE_DIAGRAM: 'BI.view.typeDiagram',
    ADD_CONFIGURATION: 'BI.project-explorer.add-configuration',
    ADD_PROJECT: 'BI.project-explorer.add',
    SHOW_OVERVIEW: 'BI.project-explorer.overview',
    ADD_DATA_MAPPER: 'BI.project-explorer.add-data-mapper',
    BI_EDIT_TEST_FUNCTION: 'BI.test.edit.function',
    BI_ADD_TEST_FUNCTION: 'BI.test.add.function'
};
