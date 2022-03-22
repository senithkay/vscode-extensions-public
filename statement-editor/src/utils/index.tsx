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
import React, { ReactNode } from 'react';

import {
    CompletionResponse,
    ExpressionEditorLangClientInterface,
    getDiagnosticMessage,
    getFilteredDiagnostics,
    STModification
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    NodePosition,
    STKindChecker,
    STNode,
    traversNode
} from "@wso2-enterprise/syntax-tree";
import { Diagnostic } from "vscode-languageserver-protocol";

import * as expressionTypeComponents from '../components/ExpressionTypes';
import * as statementTypeComponents from '../components/Statements';
import {
    EXPR_PLACE_HOLDER_DIAG,
    OTHER_EXPRESSION,
    OTHER_STATEMENT,
    StatementNodes,
    TYPE_DESC_PLACE_HOLDER_DIAG
} from "../constants";
import { ModelKind, RemainingContent, StmtDiagnostic, StmtOffset } from '../models/definitions';
import { visitor as DeleteConfigSetupVisitor } from "../visitors/delete-config-setup-visitor";
import { visitor as DiagnosticsMappingVisitor } from "../visitors/diagnostics-mapping-visitor";
import { visitor as ExpressionDeletingVisitor } from "../visitors/expression-deleting-visitor";
import { visitor as ModelFindingVisitor } from "../visitors/model-finding-visitor";
import { viewStateSetupVisitor as ViewStateSetupVisitor } from "../visitors/view-state-setup-visitor";

import { addImportStatements, addStatementToTargetLine } from "./ls-utils";
import { createImportStatement, createStatement, updateStatement } from "./statement-modifications";

export function getModifications(
        model: STNode,
        config: {
            type: string;
            model?: STNode;
        },
        formArgs: any,
        modulesToBeImported?: string[]): STModification[] {
    const modifications: STModification[] = [];
    const importStatementRegex = /ballerinax?\/[^;]+/g;

    if (STKindChecker.isLocalVarDecl(model) ||
            STKindChecker.isCallStatement(model) ||
            STKindChecker.isReturnStatement(model) ||
            STKindChecker.isAssignmentStatement(model) ||
            (config && config.type === 'Custom')) {
        let source = model.source;
        if (STKindChecker.isCallStatement(model) && model.source.slice(-1) !== ';') {
            source += ';';
        }
        if (config.model) {
            modifications.push(updateStatement(source, formArgs.formArgs?.model.position));
        } else {
            modifications.push(createStatement(source, formArgs.formArgs?.targetPosition));
        }
    }

    if (STKindChecker.isWhileStatement(model) ||
            STKindChecker.isIfElseStatement(model) ||
            STKindChecker.isForeachStatement(model)) {
        if (!formArgs.formArgs?.config) {
            modifications.push(createStatement(model.source, formArgs.formArgs?.targetPosition));
        } else {
            modifications.push(updateStatement(model.source, config.model.position));
        }
    }

    if (modulesToBeImported) {
        modulesToBeImported.map((moduleNameStr: string) => (
            modifications.push(createImportStatement(importStatementRegex.exec(moduleNameStr).pop()))
        ));
    }

    return modifications;
}

export function getExpressionTypeComponent(expression: STNode, isTypeDescriptor: boolean): ReactNode {
    let ExprTypeComponent = (expressionTypeComponents as any)[expression.kind];

    if (!ExprTypeComponent) {
        ExprTypeComponent = (expressionTypeComponents as any)[OTHER_EXPRESSION];
    }

    return (
        <ExprTypeComponent
            model={expression}
            isTypeDesc={isTypeDescriptor}
        />
    );
}

export function getStatementTypeComponent(
    model: StatementNodes
): ReactNode {
    let StatementTypeComponent = (statementTypeComponents as any)[model?.kind];

    if (!StatementTypeComponent) {
        StatementTypeComponent = (statementTypeComponents as any)[OTHER_STATEMENT];
    }

    return (
        <StatementTypeComponent
            model={model}
        />
    );
}

export function getCurrentModel(position: NodePosition, model: STNode): STNode {
    ModelFindingVisitor.setPosition(position);
    traversNode(model, ModelFindingVisitor);

    return ModelFindingVisitor.getModel();
}

export function enrichModelWithDeletableState(model: STNode): STNode  {
    traversNode(model, ViewStateSetupVisitor);
    traversNode(model, DeleteConfigSetupVisitor);

    return model;
}

export function getRemainingContent(position: NodePosition, model: STNode): RemainingContent {
    ExpressionDeletingVisitor.setPosition(position);
    traversNode(model, ExpressionDeletingVisitor);

    return ExpressionDeletingVisitor.getContent();
}

export function enrichModelWithDiagnostics(diagnostics: Diagnostic[], targetPosition: NodePosition,
                                           model: STNode): STNode {
    const offset: StmtOffset = {
        startColumn: targetPosition.startColumn,
        startLine: targetPosition.startLine
    }
    diagnostics.map(diagnostic => {
        DiagnosticsMappingVisitor.setDiagnosticsNOffset(diagnostic, offset);
        traversNode(model, DiagnosticsMappingVisitor);
    });

    return model;
}

export function isPositionsEquals(position1: NodePosition, position2: NodePosition): boolean {
    return position1?.startLine === position2?.startLine &&
        position1?.startColumn === position2?.startColumn &&
        position1?.endLine === position2?.endLine &&
        position1?.endColumn === position2?.endColumn;
}

export function isOperator(modelKind: ModelKind): boolean {
    return modelKind === ModelKind.Operator;
}

export function isTypeDesc(modelKind: ModelKind): boolean {
    return modelKind === ModelKind.TypeDesc;
}

export function isBindingPattern(modelKind: ModelKind): boolean {
    return modelKind === ModelKind.BindingPattern;
}

export function getFilteredDiagnosticMessages(source: string, targetPosition: NodePosition,
                                              diagnostics: Diagnostic[]): StmtDiagnostic[] {
    const stmtDiagnostics: StmtDiagnostic[] = [];

    const diag = getFilteredDiagnostics(diagnostics, false);

    const diagnosticTargetPosition: NodePosition = {
        startLine: targetPosition.startLine || 0,
        startColumn: targetPosition.startColumn || 0,
        endLine: targetPosition?.endLine || targetPosition.startLine,
        endColumn: targetPosition?.endColumn || 0
    };

    getDiagnosticMessage(diag, diagnosticTargetPosition, 0, source.length, 0, 0).split('. ').map(message => {
            let isPlaceHolderDiag = false;
            if (message === EXPR_PLACE_HOLDER_DIAG || message === TYPE_DESC_PLACE_HOLDER_DIAG) {
                isPlaceHolderDiag = true;
            }
            if (!!message) {
                stmtDiagnostics.push({message, isPlaceHolderDiag});
            }
        });

    return stmtDiagnostics;
}

export async function getUpdatedSource(statementModel: STNode, currentModel: NodePosition, newValue: string,
                                       currentFileContent: string, targetPosition: NodePosition, moduleList: Set<string>,
                                       getLangClient: () => Promise<ExpressionEditorLangClientInterface>)
    : Promise<string> {

    let updatedStatement = addExpressionToTargetPosition(statementModel, currentModel, newValue);
    if (updatedStatement.slice(-1) !== ';') {
        updatedStatement += ';';
    }
    let updatedContent: string = await addStatementToTargetLine(currentFileContent, targetPosition,
        updatedStatement, getLangClient);
    if (!!moduleList.size) {
        updatedContent = await addImportStatements(updatedContent, Array.from(moduleList) as string[]);
    }

    return updatedContent;
}

function addExpressionToTargetPosition(statementModel: STNode, currentPosition: NodePosition, newValue: string): string {
    const startLine = currentPosition.startLine;
    const startColumn = currentPosition.startColumn;
    const endColumn = currentPosition.endColumn;

    if (statementModel && STKindChecker.isIfElseStatement(statementModel)) {
        const splitStatement: string[] = statementModel.source.split(/\n/g) || [];

        splitStatement.splice(startLine, 1, splitStatement[startLine].slice(0, startColumn) +
            newValue + splitStatement[startLine].slice(endColumn || startColumn));

        return splitStatement.join('\n');
    }

    return statementModel.source.slice(0, startColumn) + newValue + statementModel.source.slice(endColumn || startColumn);
}

export function getSuggestionIconStyle(suggestionType: number): string {
    let suggestionIconStyle: string;
    switch (suggestionType) {
        case 3:
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-function"
            break;
        case 5:
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-field"
            break;
        case 6:
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-variable"
            break;
        case 11:
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-ruler"
            break;
        case 14:
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-keyword"
            break;
        case 20:
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-enum-member"
            break;
        case 22:
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-struct"
            break;
        case 25:
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-type-parameter"
            break;
        default:
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-variable"
            break;
    }
    return suggestionIconStyle;
}

export function sortSuggestions(x: CompletionResponse, y: CompletionResponse) {
    if (!!x.sortText && !!y.sortText) {
        return x.sortText.localeCompare(y.sortText);
    }
    return 0;
}

export function getModuleIconStyle(label: string): string {
    let suggestionIconStyle: string;
    switch (label) {
        case "Functions":
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-function"
            break;
        case "Classes":
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-interface"
            break;
        case "Constants":
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-variable"
            break;
        case "Errors":
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-event"
            break;
        case "Enums":
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-enum"
            break;
        case "Records":
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-struct"
            break;
        case "Types":
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-ruler"
            break;
        case "Listeners":
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-variable"
            break;
        default:
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-interface"
            break;
    }
    return suggestionIconStyle;
}
