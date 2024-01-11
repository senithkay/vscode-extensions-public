/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ApiDirectoryResponse, CommandsRequest, CommandsResponse, ConnectorRequest, ConnectorResponse, ConnectorsResponse, CreateAPIRequest, OpenDiagramRequest, ProjectStructureRequest, ProjectStructureResponse, ShowErrorMessageRequest, getSTRequest, getSTResponse } from "./types";

export interface MiDiagramAPI {
    executeCommand: (params: CommandsRequest) => Promise<CommandsResponse>;
    getSyntaxTree: (params: getSTRequest) => Promise<getSTResponse>;
    getConnectors: () => Promise<ConnectorsResponse>;
    getConnector: (params: ConnectorRequest) => Promise<ConnectorResponse>;
    getProjectStructure: (params: ProjectStructureRequest) => Promise<ProjectStructureResponse>;
    getAPIDirectory: () => Promise<ApiDirectoryResponse>;
    createAPI: (params: CreateAPIRequest) => Promise<CreateAPIRequest>;
    showErrorMessage: (params: ShowErrorMessageRequest) => void;
    refresh: () => void;
    applyEdit: () => void;
    closeWebViewNotification: () => void;
    openDiagram: (params: OpenDiagramRequest) => void;
}
