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
    getDiagnosticMessage,
    getFilteredDiagnostics,
    STModification
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    Minutiae,
    NodePosition,
    STKindChecker,
    STNode,
    traversNode
} from "@wso2-enterprise/syntax-tree";
import { Diagnostic } from "vscode-languageserver-protocol";

import * as expressionTypeComponents from '../components/ExpressionTypes';
import * as statementTypeComponents from '../components/Statements';
import {
    END_OF_LINE_MINUTIAE,
    OTHER_EXPRESSION,
    OTHER_STATEMENT,
    PLACE_HOLDER_DIAGNOSTIC_MESSAGES,
    StatementNodes,
    WHITESPACE_MINUTIAE
} from "../constants";
import { MinutiaeJSX, RemainingContent, StmtDiagnostic, StmtOffset } from '../models/definitions';
import { visitor as DeleteConfigSetupVisitor } from "../visitors/delete-config-setup-visitor";
import { visitor as DiagnosticsMappingVisitor } from "../visitors/diagnostics-mapping-visitor";
import { visitor as ExpressionDeletingVisitor } from "../visitors/expression-deleting-visitor";
import { visitor as ModelFindingVisitor } from "../visitors/model-finding-visitor";
import { visitor as ModelKindSetupVisitor } from "../visitors/model-kind-setup-visitor";
import { viewStateSetupVisitor as ViewStateSetupVisitor } from "../visitors/view-state-setup-visitor";

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
        modulesToBeImported.map((moduleNameStr: string) => {
            modifications.push(createImportStatement(moduleNameStr));
        });
    }

    return modifications;
}

export function getExpressionTypeComponent(expression: STNode): ReactNode {
    let ExprTypeComponent = (expressionTypeComponents as any)[expression.kind];

    if (!ExprTypeComponent) {
        ExprTypeComponent = (expressionTypeComponents as any)[OTHER_EXPRESSION];
    }

    return (
        <ExprTypeComponent
            model={expression}
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

export function enrichModel(model: STNode, targetPosition: NodePosition, diagnostics?: Diagnostic[]): STNode {
    traversNode(model, ViewStateSetupVisitor);
    model = enrichModelWithDiagnostics(model, targetPosition, diagnostics);
    return enrichModelWithViewState(model);
}

export function enrichModelWithDiagnostics(model: STNode, targetPosition: NodePosition,
                                           diagnostics: Diagnostic[]): STNode {
    if (diagnostics) {
        const offset: StmtOffset = {
            startColumn: targetPosition.startColumn,
            startLine: targetPosition.startLine
        }
        diagnostics.map(diagnostic => {
            DiagnosticsMappingVisitor.setDiagnosticsNOffset(diagnostic, offset);
            traversNode(model, DiagnosticsMappingVisitor);
        });
    }
    return model;
}

export function enrichModelWithViewState(model: STNode): STNode  {
    traversNode(model, DeleteConfigSetupVisitor);
    traversNode(model, ModelKindSetupVisitor);

    return model;
}

export function getRemainingContent(position: NodePosition, model: STNode): RemainingContent {
    ExpressionDeletingVisitor.setPosition(position);
    traversNode(model, ExpressionDeletingVisitor);

    return ExpressionDeletingVisitor.getContent();
}

export function isPositionsEquals(position1: NodePosition, position2: NodePosition): boolean {
    return position1?.startLine === position2?.startLine &&
        position1?.startColumn === position2?.startColumn &&
        position1?.endLine === position2?.endLine &&
        position1?.endColumn === position2?.endColumn;
}

export function getFilteredDiagnosticMessages(stmtLength: number, targetPosition: NodePosition,
                                              diagnostics: Diagnostic[]): StmtDiagnostic[] {
    const stmtDiagnostics: StmtDiagnostic[] = [];

    const diag = getFilteredDiagnostics(diagnostics, false);

    const diagnosticTargetPosition: NodePosition = {
        startLine: targetPosition.startLine || 0,
        startColumn: targetPosition.startColumn || 0,
        endLine: targetPosition?.endLine || targetPosition.startLine,
        endColumn: targetPosition?.endColumn || 0
    };

    getDiagnosticMessage(diag, diagnosticTargetPosition, 0, stmtLength, 0, 0).split('. ').map(message => {
            let isPlaceHolderDiag = false;
            if (PLACE_HOLDER_DIAGNOSTIC_MESSAGES.includes(message)) {
                isPlaceHolderDiag = true;
            }
            if (!!message) {
                stmtDiagnostics.push({message, isPlaceHolderDiag});
            }
        });

    return stmtDiagnostics;
}

export async function getUpdatedSource(updatedStatement: string, currentFileContent: string,
                                       targetPosition: NodePosition, moduleList: Set<string>): Promise<string> {

    const statement = updatedStatement.trim().endsWith(';') ? updatedStatement : updatedStatement + ';';
    let updatedContent: string = addToTargetPosition(currentFileContent, targetPosition, statement);
    if (!!moduleList.size) {
        updatedContent = addImportStatements(updatedContent, Array.from(moduleList) as string[]);
    }

    return updatedContent;
}

export function addToTargetPosition(currentContent: string, position: NodePosition, updatedStatement: string): string {

    const splitContent: string[] = currentContent.split(/\n/g) || [];
    const splitUpdatedStatement: string[] = updatedStatement.trimEnd().split(/\n/g) || [];
    const noOfLines: number = position.endLine - position.startLine + 1;
    const startLine = splitContent[position.startLine].slice(0, position.startColumn);
    const endLine = isFinite(position?.endLine) ?
        splitContent[position.endLine].slice(position.endColumn || position.startColumn) : '';

    const replacements = splitUpdatedStatement.map((line, index) => {
        let modifiedLine = line;
        if (index === 0) {
            modifiedLine = startLine + modifiedLine;
        }
        if (index === splitUpdatedStatement.length - 1) {
            modifiedLine = modifiedLine + endLine;
        }
        if (index > 0) {
            modifiedLine = " ".repeat(position.startColumn) + modifiedLine;
        }
        return modifiedLine;
    });

    splitContent.splice(position.startLine, noOfLines, ...replacements);

    return splitContent.join('\n');
}

export function addImportStatements(
    currentFileContent: string,
    modulesToBeImported: string[]): string {
    let moduleList : string = "";
    modulesToBeImported.forEach(module => {
        moduleList += "import " + module + "; ";
    });
    return moduleList + currentFileContent;
}

export function getMinutiaeJSX(model: STNode): MinutiaeJSX {
    return {
        leadingMinutiaeJSX: getJSXForMinutiae(model.leadingMinutiae),
        trailingMinutiaeJSX: getJSXForMinutiae(model.trailingMinutiae)
    };
}

function getJSXForMinutiae(minutiae: Minutiae[]): ReactNode[] {
    return minutiae.map((element) => {
        if (element.kind === WHITESPACE_MINUTIAE) {
            return Array.from({length: element.minutiae.length}, () => <>&nbsp;</>);
        } else if (element.kind === END_OF_LINE_MINUTIAE) {
            return <br/>;
        }
    });
}

export function getClassNameForToken(model: STNode): string {
    let className = '';

    if (STKindChecker.isBooleanLiteral(model)) {
        className = 'boolean-literal';
    } else if (STKindChecker.isNumericLiteral(model)) {
        className = 'numeric-literal';
    } else if (STKindChecker.isStringLiteralToken(model)) {
        className = 'string-literal';
    } else if (STKindChecker.isBooleanKeyword(model)) {
        className = 'type-descriptor boolean';
    } else if (STKindChecker.isDecimalKeyword(model)) {
        className = 'type-descriptor decimal';
    } else if (STKindChecker.isFloatKeyword(model)) {
        className = 'type-descriptor float';
    } else if (STKindChecker.isIntKeyword(model)) {
        className = 'type-descriptor int';
    } else if (STKindChecker.isJsonKeyword(model)) {
        className = 'type-descriptor json';
    } else if (STKindChecker.isStringKeyword(model)) {
        className = 'type-descriptor string';
    } else if (STKindChecker.isVarKeyword(model)) {
        className = 'type-descriptor var';
    }

    return className;
}

export function getStringForMinutiae(minutiae: Minutiae[]): string {
    return minutiae.map((element) => {
        return element.minutiae;
    }).join('');
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
