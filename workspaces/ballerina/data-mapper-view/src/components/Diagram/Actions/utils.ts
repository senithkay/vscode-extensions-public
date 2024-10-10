/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */


import { BaseModel } from "@projectstorm/react-canvas-core";
import {
    ListConstructorNode,
    MappingConstructorNode,
    PrimitiveTypeNode,
    QueryExpressionNode,
    RequiredParamNode,
    EnumTypeNode,
    FromClauseNode,
    JoinClauseNode,
    LetClauseNode,
    LetExpressionNode,
    LinkConnectorNode,
    ModuleVariableNode,
    UnionTypeNode,
    UnsupportedIONode
} from "../Node";
import { IO_NODE_DEFAULT_WIDTH } from "../utils/constants";

export const INPUT_NODES = [
    RequiredParamNode,
    FromClauseNode,
    LetExpressionNode,
    ModuleVariableNode,
    EnumTypeNode,
    LetClauseNode,
    JoinClauseNode
];

export const OUTPUT_NODES = [
    MappingConstructorNode,
    ListConstructorNode,
    PrimitiveTypeNode,
    UnionTypeNode,
    UnsupportedIONode
];

export const INTERMEDIATE_NODES = [
    LinkConnectorNode,
    QueryExpressionNode
];

export const MIN_VISIBLE_HEIGHT = 68;
export const INPUT_NODE_DEFAULT_RIGHT_X = IO_NODE_DEFAULT_WIDTH;

export function isInputNode(node: BaseModel) {
    return INPUT_NODES.some(nodeType => node instanceof nodeType);
}

export function isOutputNode(node: BaseModel) {
    return OUTPUT_NODES.some(nodeType => node instanceof nodeType);
}

export function isIntermediateNode(node: BaseModel) {
    return INTERMEDIATE_NODES.some(nodeType => node instanceof nodeType);
}
