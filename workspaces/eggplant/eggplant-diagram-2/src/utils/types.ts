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
};

export type Node = {
    // todo: need to refactor node type with attributes and children
    id: string;
    kind: string;
    label?: string;
    method?: Expression;
    path?: Expression;
    client?: Expression;
    headers?: Expression;
    targetType?: Expression;
    params?: Expression;
    variable?: Expression;
    lineRange: LineRange;
    condition?: Expression;
    thenBranch?: Node;
    elseBranch?: Node;
    children?: Node[];
    fixed?: boolean;
    expr?: Expression;
    returning?: boolean;
    viewState?: ViewState;
};

export type Expression = {
    key: string;
    type: null | string;
    value?: any[] | string;
    typeKind?: TypeKind;
    optional?: boolean;
};

export type TypeKind = "BTYPE" | "IDENTIFIER" | "URI_PATH";

export type LineRange = {
    fileName: string;
    startLine: number[];
    endLine: number[];
};

export type ViewState = {
    x: number;
    y: number;
    w: number;
    h: number;
    startNodeId?: string;
};
