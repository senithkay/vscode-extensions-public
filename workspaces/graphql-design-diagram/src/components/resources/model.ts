/**
 * Copyright (c) 2023, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

export interface GraphqlDesignModel {
    graphqlService: Service;
    records: Map<string, RecordComponent>;
    serviceClasses: Map<string, ServiceClassComponent>;
    enums: Map<string, EnumComponent>;
    unions: Map<string, UnionComponent>;
}

export interface Service {
    serviceName: string;
    position: Position;
    description: string;
    resourceFunctions: ResourceFunction[];
    remoteFunctions: RemoteFunction[];
}

export interface RecordComponent {
    name: string;
    position: Position;
    description: string;
    recordFields: RecordField[];
    isInputObject: boolean;
}

export interface ServiceClassComponent {
    serviceName: string;
    position: Position;
    description: string;
    functions: ServiceClassField[];
}

export interface EnumComponent {
    name: string;
    position: Position;
    description: string;
    enumFields: EnumField[];
}

interface UnionComponent {
    name: string;
    position: Position;
    description: string;
    possibleTypes: Interaction[];
}

interface Position {
     filePath: string;
     startLine: LinePosition;
     endLine: LinePosition;
}

interface LinePosition {
    line: number;
    offset: number;
}

export interface ResourceFunction {
    identifier: string;
    subscription: boolean;
    returns: string;
    description: string;
    isDeprecated: boolean;
    deprecationReason: string;
    parameters: Param[];
    interactions: Interaction[];
}

export interface RemoteFunction {
    identifier: string;
    returns: string;
    description: string;
    isDeprecated: boolean;
    deprecationReason: string;
    parameters: Param[];
    interactions: Interaction[];
}

export interface RecordField {
    name: string;
    type: string;
    defaultValue: string;
    description: string;
    isDeprecated: boolean;
    deprecationReason: string;
    interactions: Interaction[];
}

export interface ServiceClassField {
    identifier: string;
    returnType: string;
    description: string;
    isDeprecated: boolean;
    deprecationReason: string;
    parameters: Param[];
    interactions: Interaction[];
}

// enum ObjectKind {
//     CLASS,
//     RECORD
// }
//
// interface Field {
//     name: string;
//     type: string;
//     description: string;
//     isDeprecated: boolean;
//     deprecationReason: string;
//     interactions: Interaction[];
//     parameters: Param[];
// }

export interface EnumField {
    name: string;
    description: string;
    isDeprecated: boolean;
    deprecationReason: string;
}

interface Param {
    type: string;
    name: string;
    description: string;
    defaultValue: string;
}

export interface Interaction {
    componentName: string;
}

// enums

export enum FunctionType {
    QUERY = "Query",
    MUTATION = "Mutation",
    SUBSCRIPTION = "Subscription"
}

export enum Colors {
    PRIMARY = '#5567D5',
    SECONDARY = '#F0F1FB',
    PRIMARY_SELECTED = '#ffaf4d',
    SECONDARY_SELECTED = '#fffaf2',
    SHADED_SELECTED = '#faead2',
}
