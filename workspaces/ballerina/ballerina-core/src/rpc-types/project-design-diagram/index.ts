/**
* Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
*
* This software is the property of WSO2 LLC. and its suppliers, if any.
* Dissemination of any information or reproduction of any material contained
* herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
* You may not alter or remove any copyright or other notice from copies of this content.
*/

import { ConnectorsRequest, ConnectorsResponse } from "../connector-wizard/interfaces";
import {
    CreateComponentRequest,
    CreateComponentResponse,
    ProjectDetailsResponse,
    ProjectRootResponse,
    AddConnectorRequest,
    AddConnectorResponse,
    PullConnectorResponse,
    AddLinkRequest,
    AddLinkResponse,
    DeleteLinkRequest,
    DeleteLinkResponse,
    DirectoryResponse,
    CommandRequest,
    CommandResponse,
    BallerinaTriggersResponse,
    BallerinaTriggerResponse,
    DisplayLabelRequest,
    DisplayLabelResponse,
    ComponentModelResponse,
    DeleteComponentRequest,
    ChoreoProjectResponse,
    SelectedNodeResponse,
    CellViewResponse,
    GoToDesignRequest,
    ErrorMessageRequest,
    MultiRootWsResponse,
    LocationRequest,
    BallerinaTriggerRequest
} from "./interfaces";

export interface ProjectDesignDiagramAPI {
    createComponent: (params: CreateComponentRequest) => Promise<CreateComponentResponse>;
    getProjectDetails: () => Promise<ProjectDetailsResponse>;
    getProjectRoot: () => Promise<ProjectRootResponse>;
    addConnector: (params: AddConnectorRequest) => Promise<AddConnectorResponse>;
    pullConnector: (params: AddConnectorRequest) => Promise<PullConnectorResponse>;
    addLink: (params: AddLinkRequest) => Promise<AddLinkResponse>;
    deleteLink: (params: DeleteLinkRequest) => Promise<DeleteLinkResponse>;
    pickDirectory: () => Promise<DirectoryResponse>;
    executeCommand: (params: CommandRequest) => Promise<CommandResponse>;
    fetchTriggers: () => Promise<BallerinaTriggersResponse>;
    fetchTrigger: (params: BallerinaTriggerRequest) => Promise<BallerinaTriggerResponse>;
    editDisplayLabel: (params: DisplayLabelRequest) => Promise<DisplayLabelResponse>;
    getComponentModel: () => Promise<ComponentModelResponse>;
    showChoreoProjectOverview: () => void;
    deleteComponent: (params: DeleteComponentRequest) => void;
    isChoreoProject: () => Promise<ChoreoProjectResponse>;
    selectedNodeId: () => Promise<SelectedNodeResponse>;
    isCellView: () => Promise<CellViewResponse>;
    go2source: (params: LocationRequest) => void;
    goToDesign: (params: GoToDesignRequest) => void;
    showDiagnosticsWarning: () => void;
    showErrorMessage: (params: ErrorMessageRequest) => void;
    promptWorkspaceConversion: () => void;
    checkIsMultiRootWs: () => Promise<MultiRootWsResponse>;
    getConnectors: (params: ConnectorsRequest) => Promise<ConnectorsResponse>;
}
