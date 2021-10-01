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

import { STNode } from "@ballerina/syntax-tree";

import * as expressionTypeComponents from '../components/ExpressionTypes';
import { VariableUserInputs } from '../models/definitions';

import { DefaultModelsByKind } from "./sample-model";
import {
    ExpressionKindByOperator,
    ExpressionSuggestionsByKind,
    OperatorsForExpressionKind,
    SuggestionItem,
    TypesForExpressionKind
} from "./utils";

export function getDefaultModel(kind: string): STNode {
    return DefaultModelsByKind[kind];
}

export function getSuggestionsBasedOnExpressionKind(kind: string): SuggestionItem[] {
    return ExpressionSuggestionsByKind[kind];
}

export function getKindBasedOnOperator(operator: string): string {
    return ExpressionKindByOperator[operator];
}

export function getTypesBasedOnExpressionKind(kind: string): string[] {
    return TypesForExpressionKind[kind];
}

export function getOperatorSuggestions(kind: string): SuggestionItem[] {
    if (kind in OperatorsForExpressionKind) {
        return OperatorsForExpressionKind[kind];
    }
    return []; // we can remove the empty array return if we only set the operator prop to true for the expressions with operators
}

export function getExpressionTypeComponent(expression: STNode, callBack: (suggestions: SuggestionItem[], model: STNode, operator: boolean) => void, userInputs: VariableUserInputs, diagnosticHandler: (diagnostics: string) => void): ReactNode {
    const ExprTypeComponent = (expressionTypeComponents as any)[expression.kind];

    if (!ExprTypeComponent) {
        return null;
    }

    return <ExprTypeComponent model={expression} callBack={callBack} userInputs={userInputs} diagnosticHandler={diagnosticHandler} />;
}

// export function getSuggestionBasedOnExpressionType(Type: string[]): string[] {
//    var typesArray: string[] = [];
//    Type.map(type => (
//       typesArray = typesArray.concat(ExpressionSuggestionByType[type])))
//    return typesArray;
// }

