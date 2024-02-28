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
    flags: number;
};

export type NodeKind = "EVENT_HTTP_API" | "IF" | "BLOCK" | "RETURN" | "HTTP_API_GET_CALL";

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

export type Client = {
    id: string;
    label?: string;
    kind: ClientKind;
    lineRange: LineRange;
    scope: ClientScope;
    value: string;
    flags: number;
};

// Only for visualization purposes
export enum ClientKind {
    HTTP,
    OTHER
}

export enum ClientScope {
    LOCAL,
    OBJECT,
    GLOBAL
}

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

export type NodeProperties = {
    method?: Expression;
    path?: Expression;
    condition?: Expression;
    client?: Expression;
    targetType?: Expression;
    variable?: Expression;
    expression?: Expression;
};

export type ViewState = {
    x: number;
    y: number;
    w: number;
    h: number;
    startNodeId?: string;
};

export type LinePosition = {
    line: number;
    offset: number;
};
