/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DiagramModel } from '@projectstorm/react-diagrams';
import {
    CMEntryPoint as EntryPoint, CMLocation as Location, CMService as Service, CMAnnotation as Annotation
} from '@wso2-enterprise/ballerina-languageclient';
import { BallerinaConnectorsRequest, BallerinaConnectorsResponse, BallerinaTriggerResponse, BallerinaTriggersResponse, Connector } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { BallerinaComponentCreationParams } from '@wso2-enterprise/choreo-core';
import { NodePosition } from '@wso2-enterprise/syntax-tree';

export interface ServiceModels {
    levelOne: DiagramModel;
    levelTwo: DiagramModel;
    cellModel: DiagramModel;
}

export enum Views {
    TYPE = 'T',
    TYPE_COMPOSITION = 'TC',
    L1_SERVICES = 'S1',
    L2_SERVICES = 'S2',
    CELL_VIEW = 'CellView',
}

export enum Level {
    ONE = 1,
    TWO = 2
}

export enum DagreLayout {
    TREE = 'tight-tree',
    GRAPH = 'longest-path'
}

export enum ServiceTypes {
    HTTP = "HTTP",
    GRPC = "GRPC",
    WEBSOCKET = "Websocket",
    GRAPHQL = "GraphQL",
    WEBHOOK = "Webhook",
    OTHER = "other"
}

export enum Colors {
    CELL_DIAGRAM_BACKGROUND = '#eeeffb',
    CONSOLE_CELL_DIAGRAM_BACKGROUND = '#f7f8fb',
    DEFAULT_TEXT = '#40404B',
    DIAGRAM_BACKGROUND = '#FFF',
    GATEWAY = '#c9c9c9',
    PRIMARY = '#5567D5',
    PRIMARY_LIGHT = '#A6B3FF',
    PRIMARY_SELECTED = '#ffaf4d',
    SECONDARY = '#F0F1FB',
    SECONDARY_SELECTED = '#fffaf2',
    SHADED_SELECTED = '#faead2',
    PRIMARY_FOCUSED = '#d59155',
}

export const GRAPHQL_SUBSCRIBE_ACTION = 'subscribe';

export interface EditLayerAPI {
    getProjectRoot: () => Promise<string | undefined>;
    createComponent: (args: BallerinaComponentCreationParams) => Promise<string>;
    getConnectors: (args: BallerinaConnectorsRequest) => Promise<BallerinaConnectorsResponse>;
    pullConnector: (connector: Connector, source: Service | EntryPoint) => Promise<boolean>;
    addConnector: (connector: Connector, source: Service | EntryPoint) => Promise<boolean>;
    addLink: (source: Service | EntryPoint, target: Service) => Promise<boolean>;
    deleteLink: (linkLocation: Location, nodeLocation: Location) => Promise<boolean>;
    pickDirectory: () => Promise<string | undefined>;
    executeCommand: (cmd: string) => Promise<boolean>;
    go2source: (location: Location) => void;
    goToDesign: (filePath: string, position: NodePosition) => void;
    showDiagnosticsWarning: () => void;
    showErrorMessage: (message: string) => void;
    editDisplayLabel: (annotation: Annotation) => Promise<boolean>;
    fetchTriggers: () => Promise<BallerinaTriggersResponse>;
    fetchTrigger: (triggerId: string) => Promise<BallerinaTriggerResponse>;
    checkIsMultiRootWs: () => Promise<boolean>;
    promptWorkspaceConversion: () => void;
}

export enum ConsoleView {
    PROJECT_HOME = 'PROJECT_HOME',
    COMPONENTS = 'COMPONENTS',
}
