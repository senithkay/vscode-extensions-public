/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export type Flow = {
    nodes: Node[];
    name: string;
    clients?: Client[];
};

export type Client = {
    id: string;
    label: string;
    kind: ClientKind;
    lineRange: LineRange;
    scope: ClientScope;
    value: string;
    flags: number;
};

export type ClientKind = "HTTP" | "OTHER";

export type ClientScope = "LOCAL" | "OBJECT" | "GLOBAL";

export type Node = {
    kind: NodeKind;
    label: string;
    nodeProperties: NodeProperties;
    returning: boolean;
    fixed: boolean;
    id: string;
    lineRange: LineRange;
    branches?: Branch[];
    viewState?: ViewState;
    flags?: number;
};

export type NodeKind =
    | "EVENT_HTTP_API"
    | "BLOCK"
    | "IF"
    | "HTTP_API_GET_CALL"
    | "HTTP_API_POST_CALL"
    | "RETURN"
    | "EXPRESSION";

export type Branch = {
    kind: string;
    label: string;
    children: Node[];
};

export type LineRange = {
    fileName: string;
    startLine: number[];
    endLine: number[];
};

export type Expression = {
    label: string;
    type: null | string;
    typeKind: TypeKind;
    optional: boolean;
    editable: boolean;
    documentation: string;
    value: string;
};

export type TypeKind = "BTYPE" | "IDENTIFIER" | "URI_PATH";

export type NodePropertyKey = "method" | "path" | "condition" | "client" | "targetType" | "variable" | "expression";

export type NodeProperties = { [P in NodePropertyKey]?: Expression; };

export type ViewState = {
    x: number;
    y: number;
    w: number;
    h: number;
    startNodeId?: string;
};

// Add node target position metadata
export type TargetMetadata = {
    topNodeId: string;
    bottomNodeId?: string;
    linkLabel?: string;
};
