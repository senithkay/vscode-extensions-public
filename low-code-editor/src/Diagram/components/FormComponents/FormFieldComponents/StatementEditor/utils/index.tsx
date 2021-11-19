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
    STKindChecker,
    STNode
} from "@ballerina/syntax-tree";

import {
    ExpressionEditorLangClientInterface,
    PartialSTRequest,
    STModification
} from "../../../../../../Definitions";
import { ConditionConfig, EndConfig, ProcessConfig } from "../../../Types";
import * as expressionTypeComponents from '../components/ExpressionTypes';
import * as statementTypeComponents from '../components/Statements';
import * as c from "../constants";
import { SuggestionItem, VariableUserInputs } from '../models/definitions';

import { createStatement, updateStatement } from "./statement-modifications";
import {
    DataTypeByExpressionKind,
    ExpressionKindByOperator,
    ExpressionSuggestionsByKind,
    OperatorsForExpressionKind,
    TypeDescriptors
} from "./utils";

export async function getPartialSTForStatement(
            partialSTRequest: PartialSTRequest,
            lsUrl: string,
            ls?: any
        ): Promise<STNode> {
    const langClient: ExpressionEditorLangClientInterface = await ls.getExpressionEditorLangClient(lsUrl);
    const resp = await langClient.getSTForSingleStatement(partialSTRequest);
    return resp.syntaxTree;
}

export async function getPartialSTForExpression(
            partialSTRequest: PartialSTRequest,
            lsUrl: string,
            ls?: any
        ): Promise<STNode> {
    const langClient: ExpressionEditorLangClientInterface = await ls.getExpressionEditorLangClient(lsUrl);
    const resp = await langClient.getSTForExpression(partialSTRequest);
    return resp.syntaxTree;
}

export function getModifications(
        model: STNode, config: ProcessConfig | EndConfig | ConditionConfig, formArgs: any): STModification[] {
    const modifications: STModification[] = [];

    if (STKindChecker.isLocalVarDecl(model) ||
            STKindChecker.isCallStatement(model) ||
            STKindChecker.isReturnStatement(model) ||
            STKindChecker.isAssignmentStatement(model) ||
            (config && config.type === 'Custom')) {
        if (config.model) {
            modifications.push(updateStatement(model.source, formArgs.formArgs?.model.position));
        } else {
            modifications.push(createStatement(model.source, formArgs.formArgs?.targetPosition));
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

    return modifications;
}

export function getSuggestionsBasedOnExpressionKind(kind: string): SuggestionItem[] {
    return ExpressionSuggestionsByKind[kind];
}

export function getTypeDescriptors(): SuggestionItem[] {
    return TypeDescriptors;
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
            diagnosticHandler={diagnosticHandler}
            isTypeDescriptor={isTypeDescriptor}
        />
    );
}

export function getStatementTypeComponent(
    model: c.StatementNodes,
    userInputs: VariableUserInputs,
    diagnosticHandler: (diagnostics: string) => void
): ReactNode {
    let StatementTypeComponent = (statementTypeComponents as any)[model.kind];

    if (!StatementTypeComponent) {
        StatementTypeComponent = (statementTypeComponents as any)[c.OTHER_STATEMENT];
    }

    return (
        <StatementTypeComponent
            model={model}
            userInputs={userInputs}
            diagnosticHandler={diagnosticHandler}
        />
    );
}
