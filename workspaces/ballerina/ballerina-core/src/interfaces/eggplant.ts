/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";
import { LinePosition } from "./common";

export type { NodePosition };

export type Flow = {
    fileName: string;
    nodes: FlowNode[];
    connections?: FlowNode[];
};

export type Client = {
    id: string;
    label: string;
    kind: ClientKind;
    lineRange: ELineRange;
    scope: ClientScope;
    value: string;
    flags: number;
};

export type ClientKind = "HTTP" | "OTHER";

export type ClientScope = "LOCAL" | "OBJECT" | "GLOBAL";

export type FlowNode = {
    id: string;
    metadata: Metadata;
    codedata: CodeData;
    properties?: NodeProperties;
    branches: Branch[];
    flags?: number;
    returning: boolean;
    suggested?: boolean;
    viewState?: ViewState;
};

export type Metadata = {
    label: string;
    description: string;
    icon?: string;
    keywords?: string[];
    draft?: boolean; // for diagram draft nodes
};

export type Property = {
    metadata: Metadata;
    valueType: string;
    value: string;
    optional: boolean;
    editable: boolean;
    valueTypeConstraint?: string[];
};

export type CodeData = {
    node: NodeKind;
    org?: string;
    module?: string;
    object?: string;
    symbol?: string;
    lineRange?: ELineRange;
    sourceCode?: string;
};

export type Branch = {
    label: string;
    kind: BranchKind;
    codedata: CodeData;
    repeatable: Repeatable;
    properties: NodeProperties;
    children: FlowNode[];
    viewState?: ViewState;
};

export type ELineRange = {
    fileName: string;
    startLine: LinePosition;
    endLine: LinePosition;
};

export type NodeProperties = { [P in NodePropertyKey]?: Property };

export type ViewState = {
    // element view state
    x: number;
    y: number;
    w: number;
    h: number;
    // container view state
    cw?: number;
    ch?: number;
    // flow start node
    startNodeId?: string;
};

// Add node target position metadata
export type TargetMetadata = {
    topNodeId: string;
    bottomNodeId?: string;
    linkLabel?: string;
};

export enum DIRECTORY_MAP {
    SERVICES = "services",
    TASKS = "tasks",
    TRIGGERS = "triggers",
    CONNECTIONS = "connections",
    SCHEMAS = "schemas",
    CONFIGURATIONS = "configurations",
}

export interface ProjectStructureResponse {
    directoryMap: {
        [DIRECTORY_MAP.SERVICES]: ProjectStructureArtifactResponse[];
        [DIRECTORY_MAP.TASKS]: ProjectStructureArtifactResponse[];
        [DIRECTORY_MAP.TRIGGERS]: ProjectStructureArtifactResponse[];
        [DIRECTORY_MAP.CONNECTIONS]: ProjectStructureArtifactResponse[];
        [DIRECTORY_MAP.SCHEMAS]: ProjectStructureArtifactResponse[];
        [DIRECTORY_MAP.CONFIGURATIONS]: ProjectStructureArtifactResponse[];
    };
}

export interface ProjectStructureArtifactResponse {
    name: string;
    path: string;
    type: string;
    icon?: string;
    context?: string;
    position?: NodePosition;
    st?: STNode;
}
export type Item = Category | AvailableNode;

export type Category = {
    metadata: Metadata;
    items: Item[];
};

export type AvailableNode = {
    metadata: Metadata;
    codedata: CodeData;
    enabled: boolean;
};

export type DiagramLabel = "On Fail" | "Body";

export type NodePropertyKey =
    | "method"
    | "path"
    | "condition"
    | "client"
    | "targetType"
    | "variable"
    | "expression"
    | "comment"
    | "connection";

export type BranchKind = "block" | "worker";

export type Repeatable = "1+" | "0..1" | "1" | "0+";

export type Scope = "module" | "local" | "object";

export type NodeKind =
    | "EMPTY"
    | "DRAFT"
    | "EVENT_HTTP_API"
    | "IF"
    | "ACTION_CALL"
    | "RETURN"
    | "EXPRESSION"
    | "ERROR_HANDLER"
    | "WHILE"
    | "CONTINUE"
    | "BREAK"
    | "PANIC"
    | "START"
    | "STOP"
    | "TRANSACTION"
    | "LOCK"
    | "FAIL"
    | "CONDITIONAL"
    | "ELSE"
    | "ON_FAILURE"
    | "BODY"
    | "NEW_DATA"
    | "UPDATE_DATA"
    | "NEW_CONNECTION"
    | "COMMENT"
    | "DATA_MAPPER";


export type OverviewFlow = {
    entryPoints: EntryPoint[];
    name: string;
    thinking: string;
    connections: Connection[];
}

export type EntryPoint = {
    id: string;
    name: string;
    type: string;
    status: string;
    dependencies: Dependency[];
}

export type Dependency = {
    id: string;
    status: string;
}

export type Connection = {
    id: string;
    name: string;
    status: string;
    org?: string;
    package?: string;
    client?: string;
}
