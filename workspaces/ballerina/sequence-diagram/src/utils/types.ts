/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { BaseNodeModel } from "../components/nodes/BaseNode";
import { EmptyNodeModel } from "../components/nodes/EmptyNode";

// Flow model types

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
    viewState?: ViewState;
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
    RETURN = "RETURN",
}

export type Node = {
    interactionType?: InteractionType;
    properties: NodeProperties;
    targetId?: string;
    kind: NodeKind;
    location: Location;
    branches?: NodeBranch[];
    viewStates?: ViewState[];
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

export enum ViewStateLabel {
    DEFAULT_NODE = "DEFAULT",
    SOURCE_NODE = "SOURCE_NODE",
    TARGET_NODE = "TARGET_NODE",
    RETURN_SOURCE_NODE = "RETURN_SOURCE_NODE",
    RETURN_TARGET_NODE = "RETURN_TARGET_NODE",
}

export type ViewState = {
    label: ViewStateLabel | string;
    bBox: BBox;
};

export type BBox = {
    // element
    x: number;
    y: number;
    w: number;
    h: number;
    // container
    cx: number;
    cy: number;
    cw: number;
    ch: number;
};

export type DiagramElementType = ParticipantType | NodeKind | InteractionType;

export type DiagramElement = Participant | Node;

// Diagram types

export type NodeModel = BaseNodeModel | EmptyNodeModel;
