/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export type Flow = {
    id: string;
    name: string;
    nodes: Node[];
    fileName: string;
    bodyCodeLocation: CodeLocation;
};

export type NodeKinds =
    | "StartNode"
    | "EndNode"
    | "CodeBlockNode"
    | "switch" // TODO: Need to update after backend implementation support to SwitchNode
    | "HttpRequestNode"
    | "TransformNode";

export type Node = {
    id?: string;
    name: string;
    templateId?: NodeKinds;
    inputPorts: InputPort[];
    outputPorts: OutputPort[];
    codeLocation: CodeLocation;
    canvasPosition?: CanvasPosition;
    properties?: SwitchNodeProperties; // Need to update with other node types
    codeBlock?: string;
};

export type InputPort = {
    id: string;
    type: string;
    name?: string;
    sender?: string;
};

export type OutputPort = {
    id: string;
    type: string;
    name?: string;
    receiver?: string;
};

export type CodeLocation = {
    start: LinePosition;
    end: LinePosition;
};

export type CanvasPosition = {
    x: number;
    y: number;
};

export type LinePosition = {
    line: number;
    offset: number;
};

export type NodeProperties = {
    templateId?: NodeKinds;
    name?: string;
};

export type SwitchNodeProperties = NodeProperties & {
    cases: SwitchCaseBlock[];
    defaultCase?: DefaultCaseBlock;
};

export type SwitchCaseBlock = {
    expression: string | BalExpression;
    nodes: string[];
};

export type HttpRequestNodeProperties = NodeProperties & {
    action: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    basePath: string;
    headers: HttpHeader[];
    path: string;
};

export type HttpHeader = {
    name: string;
    value: string;
};

export type BalExpression = {
    expression: string;
    location: CodeLocation;
};

export type DefaultCaseBlock = {
    nodes: string[];
};
