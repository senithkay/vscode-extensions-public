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

import { CompletionResponse, STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    NodePosition,
    STKindChecker,
    STNode, traversNode
} from "@wso2-enterprise/syntax-tree";

import * as expressionTypeComponents from '../components/ExpressionTypes';
import * as statementTypeComponents from '../components/Statements';
import * as c from "../constants";
import { SuggestionItem, VariableUserInputs } from '../models/definitions';
import { visitor as ModelFindingVisitor } from "../visitors/model-finding-visitor";

import { createImportStatement, createStatement, updateStatement } from "./statement-modifications";
import {
    DataTypeByExpressionKind,
    ExpressionKindByOperator,
    ExpressionSuggestionsByKind,
    OperatorsForExpressionKind
} from "./utils";

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

export function getSuggestionsBasedOnExpressionKind(kind: string): SuggestionItem[] {
    return ExpressionSuggestionsByKind[kind];
}

export function getKindBasedOnOperator(operator: string): string {
    return ExpressionKindByOperator[operator];
}

export function getOperatorSuggestions(kind: string): SuggestionItem[] {
    if (kind in OperatorsForExpressionKind) {
        return OperatorsForExpressionKind[kind];
    }
    return []; // we can remove the empty array return if we only set the operator prop to true for the expressions with operators
}

export function getDataTypeOnExpressionKind(kind: string): string[] {
    return DataTypeByExpressionKind[kind];
}

export function getExpressionTypeComponent(
    expression: STNode,
    userInputs: VariableUserInputs,
    isElseIfMember: boolean,
    diagnosticHandler: (diagnostics: string) => void,
    isTypeDescriptor: boolean
): ReactNode {
    let ExprTypeComponent = (expressionTypeComponents as any)[expression.kind];

    if (!ExprTypeComponent) {
        ExprTypeComponent = (expressionTypeComponents as any)[c.OTHER_EXPRESSION];
    }

    return (
        <ExprTypeComponent
            model={expression}
            userInputs={userInputs}
            isElseIfMember={isElseIfMember}
            diagnosticHandler={diagnosticHandler}
            isTypeDescriptor={isTypeDescriptor}
        />
    );
}

export function getStatementTypeComponent(
    model: c.StatementNodes,
    userInputs: VariableUserInputs,
    isElseIfMember: boolean,
    diagnosticHandler: (diagnostics: string) => void
): ReactNode {
    let StatementTypeComponent = (statementTypeComponents as any)[model?.kind];

    if (!StatementTypeComponent) {
        StatementTypeComponent = (statementTypeComponents as any)[c.OTHER_STATEMENT];
    }

    return (
        <StatementTypeComponent
            model={model}
            userInputs={userInputs}
            isElseIfMember={isElseIfMember}
            diagnosticHandler={diagnosticHandler}
        />
    );
}

export function getCurrentModel(position: NodePosition, model: STNode): STNode {
    ModelFindingVisitor.setPosition(position);
    traversNode(model, ModelFindingVisitor);

    return ModelFindingVisitor.getModel();
}

export function isPositionsEquals(position1: NodePosition, position2: NodePosition): boolean {
    return position1?.startLine === position2?.startLine &&
        position1?.startColumn === position2?.startColumn &&
        position1?.endLine === position2?.endLine &&
        position1?.endColumn === position2?.endColumn;
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
    return x.sortText.localeCompare(y.sortText);
}
