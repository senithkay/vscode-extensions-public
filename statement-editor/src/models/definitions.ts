/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import { ReactNode } from "react";
import { IconType } from "react-icons";

import { SymbolInfoResponse } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

import { StmtEditorUndoRedoManager } from "../utils/undo-redo";


export interface CurrentModel {
    model: STNode,
    stmtPosition?: NodePosition,
    isEntered?: boolean
}

export interface VariableUserInputs {
    selectedType: string
    otherType?: string
    varName?: string
    variableExpression?: string
    formField?: string
}

export interface LSSuggestions {
    directSuggestions: SuggestionItem[];
    secondLevelSuggestions?: SecondLevelSuggestions;
}

export interface SuggestionItem {
    value: string;
    label?: string,
    kind?: string;
    insertText?: string;
    completionKind?: number;
    suggestionType?: number;
    insertTextFormat?: number;
    prefix?: string;
    sortText?: string;
    detail?: string;
}

export interface SecondLevelSuggestions {
    selection: string;
    secondLevelSuggestions: SuggestionItem[];
}

export interface RemainingContent {
    code: string,
    position: NodePosition
}

export interface StmtDiagnostic {
    message: string;
    isPlaceHolderDiag?: boolean;
}

export interface StmtOffset {
    startLine: number;
    startColumn: number;
}

export interface MinutiaeJSX {
    leadingMinutiaeJSX: ReactNode[];
    trailingMinutiaeJSX: ReactNode[];
}

export interface EditorModel {
    label: string;
    model: STNode;
    source: string;
    position: NodePosition;
    undoRedoManager: StmtEditorUndoRedoManager;
    isConfigurableStmt?: boolean;
    isModuleVar?: boolean;
    isExistingStmt?: boolean;
    selectedNodePosition?: NodePosition;
    newConfigurableName?: string;
}

export interface SymbolIcon {
    className: string;
    color: string;
}

// tslint:disable-next-line:no-empty-interface
export interface EmptySymbolInfo {}

export interface DocumentationInfo {
    modelPosition : NodePosition;
    documentation : SymbolInfoResponse | EmptySymbolInfo
}

export interface Suggestion {
    selectedGroup?: number,
    selectedListItem: number
}

export interface SuggestionIcon {
    SuggestIcon : IconType,
    color: string
}

