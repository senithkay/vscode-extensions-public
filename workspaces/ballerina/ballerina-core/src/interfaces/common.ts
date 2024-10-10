/* eslint-disable @typescript-eslint/no-explicit-any */

import { STNode } from "@wso2-enterprise/syntax-tree";

/**
* Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
*
* This software is the property of WSO2 LLC. and its suppliers, if any.
* Dissemination of any information or reproduction of any material contained
* herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
* You may not alter or remove any copyright or other notice from copies of this content.
*/
export declare enum BallerinaComponentTypes {
    REST_API = "restAPI",
    GRAPHQL = "graphql",
    MAIN = "main",
    WEBHOOK = "webhook",
    GRPC_API = "grpcAPI",
    WEBSOCKET_API = "websocketAPI"
}

export enum SubPanelView {
    INLINE_DATA_MAPPER = "inlineDataMapper",
    UNDEFINED = "undefined",
}

export interface DocumentIdentifier {
    uri: string;
}

export interface LineRange {
    startLine: LinePosition;
    endLine: LinePosition;
}

export interface LinePosition {
    line: number;
    offset: number;
}

export interface Range {
    start: Position;
    end: Position;
}

export interface Position {
    line: number;
    character: number;
}

export interface NOT_SUPPORTED_TYPE {

}
export interface FunctionDef {
    syntaxTree: STNode;
    defFilePath: string;
}

export interface SubPanel {
    view: SubPanelView;
    props?: SubPanelViewProps;
}

interface SubPanelViewProps {
    inlineDataMapper?: InlineDataMapperProps;
}

interface InlineDataMapperProps {
    filePath: string;
    range: Range;
}
