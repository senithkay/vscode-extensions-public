/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export type Flow = {
    participants: Participant[];
    location: Location;
};

export type Location = {
    fileName: string;
    startLine: Line;
    endLine: Line;
};

export type Line = {
    line: number;
    offset: number;
};

export enum ParticipantType {
    FUNCTION = "FUNCTION",
    ENDPOINT = "ENDPOINT",
}

export type Participant = {
    id: string;
    name: string;
    kind: ParticipantType;
    module: Module;
    nodes: Node[];
    location: Location;
};

export type Module = {
    moduleName: string;
    packageName: string;
};

export enum NodeKind {
    INTERACTION = "INTERACTION",
    IF = "IF",
    WHILE = "WHILE",
}

export enum InteractionType {
    ENDPOINT_CALL = "ENDPOINT_CALL",
    FUNCTION_CALL = "FUNCTION_CALL",
    RETURN_CALL = "RETURN_CALL",
}

export type Node = {
    interactionType?: InteractionType;
    properties: NodeProperties;
    targetId?: string;
    kind: NodeKind;
    location: Location;
    branches?: NodeBranch[];
};

export type NodeBranch = {
    label: string;
    children: Node[];
};

export type Property = {
    type: string;
    value?: string;
};

export type NodeProperties = {
    params?: Property[];
    expr?: Property;
    method?: Property;
    value?: Property;
    name?: Property;
    condition?: Property;
};

export type DiagramElementType = ParticipantType | NodeKind | InteractionType;

export type DiagramElement = Participant | Node;
