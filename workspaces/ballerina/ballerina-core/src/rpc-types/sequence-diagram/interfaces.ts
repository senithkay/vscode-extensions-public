/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export interface SequenceModelRequest {
    filePath: string;
    startLine: Line;
    endLine: Line;
}

export type SequenceModelResponse = {
    participants: Participant[];
    location: Location;
};

export type SequenceModelDiagnostic = {
    errorMsg: string;
    isIncompleteModel: boolean;
};

export type Flow = SequenceModelResponse;

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
    WORKER = "WORKER",
    ENDPOINT = "ENDPOINT",
}

export type Participant = {
    id: string;
    name: string;
    kind: ParticipantType;
    moduleName: string;
    nodes: Node[];
    location: Location;
};

export enum NodeKind {
    INTERACTION = "INTERACTION",
    IF = "IF",
    WHILE = "WHILE",
    FOREACH = "FOREACH",
    MATCH = "MATCH",
    RETURN = "RETURN",
}

export enum InteractionType {
    ENDPOINT_CALL = "ENDPOINT_CALL",
    FUNCTION_CALL = "FUNCTION_CALL",
    RETURN = "RETURN",
    METHOD_CALL = "METHOD_CALL",
    WORKER_CALL = "WORKER_CALL",
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

export type Expression = {
    type: string;
    value?: string;
};

export type NodeProperties = {
    params?: Expression[];
    expr?: Expression;
    method?: Expression;
    value?: Expression;
    name?: Expression;
    condition?: Expression;
};
