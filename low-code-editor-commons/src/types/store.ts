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
import { LocalVarDecl, NodePosition, STNode } from "@wso2-enterprise/syntax-tree";
import { Diagnostic } from "vscode-languageserver-protocol";

import { BallerinaConnectorInfo, Connector } from "./lang-client-extended";

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
    blockViewState?: any; // FIXME - For mono repo migration
    error?: any;
}

export interface ConfigOverlayFormStatus {
    isLoading: boolean;
    isOpen?: boolean;
    formArgs?: any;
    formType?: string;
    formName?: string;
    blockViewState?: any; // FIXME - For mono repo migration
    error?: any;
    isLastMember?: boolean;
}

export interface DiagramState {
    size?: DiagramSize;
    originalSyntaxTree?: STNode;
    syntaxTree?: STNode;
    diagramSt?: STNode;
    positions?: DiagramCoordinates;
    isLoadingAST?: boolean;
    configPanelStatus?: ConfigPanelStatus;
    configOverlayFormStatus?: ConfigOverlayFormStatus;
    selectedCompId?: number;
    error?: any;
    isMutationProgress?: boolean;
    isCodeEditorActive?: boolean;
    connectors?: Connector[];
    isConfigFetchInProgress?: boolean;
    diagnostics?: Diagnostic[];
    stSymbolInfo?: STSymbolInfo;
    isLoadingSuccess?: boolean;
    exprEditorState?: ExpressionEditorState;
    targetPosition?: any;
    resourceMembers?: any;
    selectedScope?: string;
    selectedResource?: string;
}

export interface ExpressionEditorState {
    name?: string;
    content?: string;
    uri?: string;
    diagnostic?: Diagnostic[];
}

export interface STSymbolInfo {
    moduleEndpoints: Map<string, STNode>;
    localEndpoints: Map<string, STNode>;
    actions: Map<string, STNode>;
    variables: Map<string, STNode[]>;
    configurables: Map<string, STNode>;
    callStatement: Map<string, STNode[]>;
    variableNameReferences: Map<string, STNode[]>;
    assignmentStatement: Map<string, STNode[]>;
    recordTypeDescriptions: Map<string, STNode>;
    listeners: Map<string, STNode>;
    moduleVariables: Map<string, STNode>;
}

export interface ComponentInitCoordinates {
    x: number;
    y: number;
    statement: STNode;
}

export interface DiagramOverlayPosition {
    x: number,
    y: number
};

export interface ConnectorConfigWizardProps {
    position: DiagramOverlayPosition;
    connectorInfo: BallerinaConnectorInfo;
    targetPosition: NodePosition;
    // This prop is used to load connectors from statement menu
    specialConnectorName?: string;
    model?: STNode;
    onClose: () => void;
    onSave: () => void;
    selectedConnector?: LocalVarDecl;
    isModuleEndpoint?: boolean;
    isAction?: boolean;
    isEdit?: boolean;
    functionNode?: STNode;
}

export interface Margin {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
}

export interface PlusWidgetProps {
    position?: DiagramOverlayPosition;
    isPlusActive?: boolean;
    onChange?: (type: string, subType: string, connector?: BallerinaConnectorInfo, isExisting?: boolean, selectedConnector?: LocalVarDecl) => void;
    onClose?: () => void;
    initPlus?: boolean;
    isResource?: boolean;
    isCallerAvailable?: boolean;
    kind?: string;
    targetPosition?: NodePosition;
    isTriggerType?: boolean;
    isLastMember?: boolean;
    showCategorized?: boolean;
    overlayId?: string;
    overlayNode? : HTMLDivElement;
    offset?: any;
}
