/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable-next-line: no-submodule-imports
import { BlockViewState } from "@wso2-enterprise/ballerina-low-code-diagram";
import { BallerinaConnectorInfo, STSymbolInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { ModulePart, STNode } from "@wso2-enterprise/syntax-tree";
import { Diagnostic } from "vscode-languageserver-protocol";

export interface DiagramCoordinates {
    start: RectCoordinates;
    stop: RectCoordinates;
    worker: WorkerCoordinates;
    connectorStart: RectCoordinates;
    connectorLine: WorkerCoordinates;
    processor: RectCoordinates;
}

export interface RectCoordinates {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface WorkerCoordinates {
    x: number;
    y: number;
    height: number;
}

export interface DiagramSize {
    width: number;
    height: number;
}

export interface ConfigPanelStatus {
    isLoading: boolean;
    isOpen?: boolean;
    formArgs?: any;
    formType?: string;
    blockViewState?: BlockViewState;
    error?: any;
}

export interface ConfigOverlayFormStatus {
    isLoading: boolean;
    isOpen?: boolean;
    formArgs?: any;
    formType?: string;
    blockViewState?: BlockViewState;
    error?: any;
}

export interface DiagramState {
    size?: DiagramSize;
    originalSyntaxTree?: ModulePart;
    syntaxTree?: STNode;
    positions?: DiagramCoordinates;
    isLoadingAST?: boolean;
    configPanelStatus?: ConfigPanelStatus;
    configOverlayFormStatus?: ConfigOverlayFormStatus;
    selectedCompId?: number;
    error?: any;
    isMutationProgress: boolean;
    isCodeEditorActive: boolean;
    connectors?: BallerinaConnectorInfo[];
    isConfigFetchInProgress?: boolean;
    diagnostics?: Diagnostic[];
    stSymbolInfo?: STSymbolInfo;
    isLoadingSuccess: boolean;
    targetPosition?: any;
    isDataMapperActive?: boolean;
}

export interface ExpressionEditorState {
    name?: string;
    content?: string;
    uri?: string;
    diagnostic?: Diagnostic[];
}

export interface ComponentInitCoordinates {
    x: number;
    y: number;
    statement: STNode;
}
