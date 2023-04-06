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
import { BallerinaConnectorsRequest, BallerinaConnectorsResponse, BallerinaTriggersResponse, Connector } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { BallerinaComponentCreationParams } from '@wso2-enterprise/choreo-core';
import { NodePosition } from '@wso2-enterprise/syntax-tree';

export interface GetComponentModelResponse {
    componentModels: {
        [key: string]: ComponentModel;
    };
    diagnostics?: ComponentModelDiagnostics[];
}

interface ModelAttributes {
    elementLocation: Location;
    diagnostics?: ElementDiagnostics[];
}

export interface ComponentModelDiagnostics {
    name: string;
    message?: string;
    severity?: string;
}

export interface ComponentModel {
    packageId: PackageID;
    services: Map<string, Service>;
    entities: Map<string, Entity>;
    functionEntryPoint: EntryPoint;
    hasCompilationErrors: boolean;
}

interface PackageID {
    name: string,
    org: string,
    version: string
}

export interface EntryPoint extends ModelAttributes {
    annotation: ServiceAnnotation;
    parameters: Parameter[];
    returns: string[];
    interactions: Interaction[];
}

export interface Service extends ModelAttributes {
    annotation: ServiceAnnotation;
    path: string;
    serviceId: string;
    resources: ResourceFunction[];
    remoteFunctions: RemoteFunction[];
    serviceType: string;
    dependencies: Dependency[];
    deploymentMetadata: DeploymentMetadata;
}

export interface ServiceAnnotation extends ModelAttributes {
    id: string;
    label: string;
}

export interface Dependency extends ModelAttributes {
    serviceId: string;
    connectorType: string;
}

export interface ResourceFunction extends ModelAttributes {
    identifier: string;
    resourceId: ResourceId;
    parameters: Parameter[];
    returns: string[];
    interactions: Interaction[];
}

export interface RemoteFunction extends ModelAttributes {
    name: string;
    parameters: Parameter[];
    returns: string[];
    interactions: Interaction[];
}

export interface Interaction extends ModelAttributes {
    resourceId: ResourceId;
    connectorType: string;
}

export interface Parameter extends ModelAttributes {
    name: string;
    type: string[];
    in?: string;
    isRequired: boolean;
}

export interface ResourceId {
    serviceId: string;
    path: string;
    action: string;
}

export interface Entity extends ModelAttributes {
    attributes: Attribute[];
    inclusions: string[];
    isAnonymous: boolean;
}

export interface Attribute extends ModelAttributes {
    name: string;
    type: string;
    defaultValue: string;
    required: boolean;
    nillable: boolean;
    associations: Association[];
}

interface Association {
    associate: string;
    cardinality: Cardinality;
}

export interface Cardinality {
    self: string;
    associate: string;
}

export interface DeploymentMetadata {
    gateways: {
        internet: {
            isExposed: boolean;
        },
        intranet: {
            isExposed: boolean;
        }
    }
}

export interface ServiceModels {
    levelOne: DiagramModel;
    levelTwo: DiagramModel;
    cellModel: DiagramModel;
}

export interface Location {
    filePath: string;
    startPosition: LinePosition;
    endPosition: LinePosition;
}

interface LinePosition {
    line: number;
    offset: number;
}

export interface ElementDiagnostics {
    message: string;
    location?: Location;
    severity?: string;
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
    addLink: (source: Service, target: Service) => Promise<boolean>;
    deleteLink: (linkLocation: Location, serviceLocation: Location) => Promise<boolean>;
    pickDirectory: () => Promise<string | undefined>;
    executeCommand: (cmd: string) => Promise<boolean>;
    go2source: (location: Location) => void;
    goToDesign: (filePath: string, position: NodePosition) => void;
    showErrorMessage: (message: string) => void;
    editDisplayLabel: (annotation: ServiceAnnotation) => Promise<boolean>;
    fetchTriggers: () => Promise<BallerinaTriggersResponse>;
}
