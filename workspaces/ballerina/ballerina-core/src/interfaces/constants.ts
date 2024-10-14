/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export enum SHARED_COMMANDS {
    SHOW_VISUALIZER = 'ballerina.show.visualizer',
    OPEN_BI_WELCOME = 'ballerina.open.bi.welcome',
    OPEN_SERVICE_FORM = 'ballerina.open.service.form',
    OPEN_AI_PANEL = 'ballerina.open.ai.panel',
    CLEAR_AI_PROMPT = 'ballerina.clear.ai.prompt',
}


export const BI_COMMANDS = {
    REFRESH_COMMAND: 'BI.project-explorer.refresh',
    FOCUS_PROJECT_EXPLORER: 'BI.project-explorer.focus',
    PROJECT_EXPLORER: 'BI.project-explorer',
    ADD_CONNECTIONS: 'BI.project-explorer.add-connection',
    ADD_ENTRY_POINT: 'BI.project-explorer.add-entry-point',
    ADD_TYPE: 'BI.project-explorer.add-type',
    ADD_FUNCTION: 'BI.project-explorer.add-function',
    OPEN_TYPE_DIAGRAM: 'BI.view.typeDiagram',
    ADD_CONFIGURATION: 'BI.project-explorer.add-configuration'
};
