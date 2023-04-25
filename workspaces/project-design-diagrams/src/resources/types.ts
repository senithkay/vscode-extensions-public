/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
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
    OTHER = "other"
}

export enum Colors {
    DIAGRAM_BACKGROUND = '#FFF',
    CELL_DIAGRAM_BACKGROUND = '#eeeffb',
    CONSOLE_CELL_DIAGRAM_BACKGROUND = '#f7f8fb',
    PRIMARY = '#5567D5',
    SECONDARY = '#F0F1FB',
    PRIMARY_SELECTED = '#ffaf4d',
    SECONDARY_SELECTED = '#fffaf2',
    SHADED_SELECTED = '#faead2',
    GATEWAY = '#c9c9c9'
}

export const GRAPHQL_SUBSCRIBE_ACTION = 'subscribe';

export interface EditLayerAPI {
    getProjectRoot: () => Promise<string | undefined>;
    createComponent: (args: BallerinaComponentCreationParams) => Promise<string>;
    getConnectors: (args: BallerinaConnectorsRequest) => Promise<BallerinaConnectorsResponse>;
    pullConnector: (connector: Connector, targetService: Service) => Promise<boolean>;
    addConnector: (connector: Connector, targetService: Service) => Promise<boolean>;
    addLink: (source: Service | EntryPoint, target: Service) => Promise<boolean>;
    deleteLink: (linkLocation: Location, serviceLocation: Location) => Promise<boolean>;
    pickDirectory: () => Promise<string | undefined>;
    executeCommand: (cmd: string) => Promise<boolean>;
    go2source: (location: Location) => void;
    goToDesign: (filePath: string, position: NodePosition) => void;
    showDiagnosticsWarning: () => void;
    showErrorMessage: (message: string) => void;
    editDisplayLabel: (annotation: Annotation) => Promise<boolean>;
    fetchTriggers: () => Promise<BallerinaTriggersResponse>;
    fetchTrigger: (triggerId: string) => Promise<BallerinaTriggerResponse>;
}

export enum ConsoleView {
    PROJECT_HOME = 'PROJECT_HOME',
    COMPONENTS = 'COMPONENTS',
}
