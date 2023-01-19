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
    object: Map<string, ObjectComponent>;
    enums: Map<string, EnumComponent>;
    unions: Map<string, UnionComponent>;
}

export interface Service {
    serviceName: string;
    position: Position;
    resourceFunctions: ResourceFunction[];
    remoteFunctions: RemoteFunction[];
}

interface ObjectComponent {
    type: ObjectKind;
    isInputObject: boolean;
    position: Position;
    fields: Field[];
}

interface EnumComponent {
    name: string;
    position: Position;
    enumFields: EnumField[];
}

interface UnionComponent {
    name: string;
    position: Position;
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
    parameters: Param[];
    interactions: Interaction[];
}

export interface RemoteFunction {
    identifier: string;
    returns: string;
    parameters: Param[];
    interactions: Interaction[];
}

enum ObjectKind {
    CLASS,
    RECORD
}

interface Field {
    name: string;
    type: string;
    description: string;
    isDeprecated: boolean;
    deprecationReason: string;
    interactions: Interaction[];
    parameters: Param[];
}

interface EnumField {
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
