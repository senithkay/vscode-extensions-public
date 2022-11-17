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

import { DiagramModel, PointModel } from '@projectstorm/react-diagrams';

export interface ComponentModel {
    packageId: PackageID;
    services: Map<string, Service>;
    entities: Map<string, Entity>;
}

interface PackageID {
    name: string,
    org: string,
    version: string
}

export interface Service {
    annotation: ServiceAnnotation;
    path: string;
    serviceId: string;
    resources: ResourceFunction[];
    remoteFunctions: RemoteFunction[];
    serviceType: string;
}

interface ServiceAnnotation {
    id: string;
    label: string;
}

export interface ResourceFunction {
    identifier: string;
    resourceId: ResourceId;
    parameters: Parameter[];
    returns: string[];
    interactions: Interaction[];
}

export interface RemoteFunction {
    name: string;
    parameters: Parameter[];
    returns: string[];
    interactions: Interaction[];
}

export interface Interaction {
    resourceId: ResourceId;
    connectorType: string;
}

export interface Parameter {
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

export interface Entity {
    attributes: Attribute[];
    inclusions: string[];
    isAnonymous: boolean;
}

export interface Attribute {
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

export interface ConnectorProps {
	point: PointModel;
    previousPoint: PointModel;
	cardinality: string;
    color: string;
}

export interface ServiceModels {
    levelOne: DiagramModel;
    levelTwo: DiagramModel;
}

export enum Views {
    TYPE = 'T',
    TYPE_COMPOSITION = 'TC',
    L1_SERVICES = 'S1',
    L2_SERVICES = 'S2'
}

export enum Level {
    ONE = 1,
    TWO = 2
}

export enum ServiceTypes {
    HTTP = "HTTP",
    GRPC = "GRPC",
    GRAPHQL = "GraphQL",
    OTHER = "other"
}

export enum Colors {
    PRIMARY = '#5567D5',
    SECONDARY = '#F0F1FB',
    PRIMARY_SELECTED = '#ffaf4d',
    SECONDARY_SELECTED = '#f7f1e9',
    SHADED_SELECTED = '#f7e4cb'
}
