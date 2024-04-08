/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
    Flow,
    Location,
    Line,
    Participant as SParticipant,
    ParticipantType,
    Node as SNode,
    NodeKind,
    InteractionType,
    NodeBranch,
    NodeProperties,
    Expression,
} from "@wso2-enterprise/ballerina-core/lib/rpc-types/sequence-diagram/interfaces";
import { BaseNodeModel } from "../components/nodes/BaseNode";
import { EmptyNodeModel } from "../components/nodes/EmptyNode";

export { ParticipantType, NodeKind, InteractionType };
export type { Flow, Location, Line, NodeBranch, NodeProperties, Expression };

export type Participant = SParticipant & {
    viewState?: ViewState;
};
export type Node = SNode & {
    viewStates?: ViewState[];
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
