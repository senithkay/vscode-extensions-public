/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NMD_Metadata as Metadata } from "./metadata-types";

export type Flow = {
    id: string;
    name: string;
    nodes: Node[];
    endpoints?: Endpoint[];
    fileName: string;
    bodyCodeLocation: CodeLocation;
};

export type NodeKinds =
    | "StartNode"
    | "HttpResponseNode"
    | "CodeBlockNode"
    | "SwitchNode"
    | "HttpRequestNode"
    | "TransformNode"
    | "DefaultNode";

export type Node = {
    id?: string;
    name: string;
    templateId?: NodeKinds;
    inputPorts: InputPort[];
    outputPorts: OutputPort[];
    codeLocation: CodeLocation;
    canvasPosition?: CanvasPosition;
    properties?: CodeNodeProperties | SwitchNodeProperties | HttpRequestNodeProperties;
    metadata?: string | Metadata;
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

export type CodeNodeProperties = NodeProperties & {
    codeBlock: BalExpression;
    returnVar?: string; // TODO: remove this
};

export type SwitchNodeProperties = NodeProperties & {
    cases: SwitchCaseBlock[];
    defaultCase?: DefaultCaseBlock;
};

export type SwitchCaseBlock = {
    expression: BalExpression;
    nodes: string[];
};

export type HttpMethod = "get" | "post" | "put" | "delete" | "patch";

export type HttpRequestNodeProperties = NodeProperties & {
    action: HttpMethod;
    path: string;
    endpoint: Endpoint;
    outputType: string;
};

export type HttpHeader = {
    name: string;
    value: string;
};

export type Endpoint = {
    name: string;
    baseUrl: string;
};

export type BalExpression = {
    expression: string;
    location?: CodeLocation;
};

export type DefaultCaseBlock = {
    nodes: string[];
};
