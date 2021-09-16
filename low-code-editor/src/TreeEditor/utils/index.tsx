import React, {ReactNode} from 'react';

import * as expressionTypeComponents from '../components/ExpressionTypes';
import {Expression} from '../models/definitions';

import {
    DefaultModelsByKind,
    ExpressionSuggestionsByKind,
    OperatorsForExpressionKind,
    TypesForExpressionKind
} from "./utils";

export function getDefaultModel(kind: string): Expression {
    return DefaultModelsByKind[kind];
}

export function getSuggestionsBasedOnExpressionKind(kind: string): string[] {
    return ExpressionSuggestionsByKind[kind];
}

export function getTypesBasedOnExpressionKind(kind: string): string[] {
    return TypesForExpressionKind[kind];
}

export function getOperatorSuggestions(kind: string): string[] {
    if (kind in OperatorsForExpressionKind) {
        return OperatorsForExpressionKind[kind];
    }
    return []; // we can remove the empty array return if we only set the operator prop to true for the expressions with operators
}

export function getExpressionTypeComponent(expression: Expression, callBack: (suggestions: string[], model: Expression, operator: boolean) => void): ReactNode {
    const ExprTypeComponent = (expressionTypeComponents as any)[expression.kind];

    if (!ExprTypeComponent) {
    }

    return <ExprTypeComponent model={expression} callBack={callBack}/>;
}

// export function getSuggestionBasedOnExpressionType(Type: string[]): string[] {
//    var typesArray: string[] = [];
//    Type.map(type => (
//       typesArray = typesArray.concat(ExpressionSuggestionByType[type])))
//    return typesArray;
// }

