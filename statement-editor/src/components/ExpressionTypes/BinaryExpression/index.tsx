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
// tslint:disable: jsx-no-multiline-js
import React, { ReactNode, useContext } from "react";

import { BinaryExpression } from "@wso2-enterprise/syntax-tree";

import { DEFAULT_EXPRESSIONS } from "../../../constants";
import { SuggestionItem } from "../../../models/definitions";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { SuggestionsContext } from "../../../store/suggestions-context";
import {
    getKindBasedOnOperator,
    getOperatorSuggestions,
    getSuggestionsBasedOnExpressionKind,
} from "../../../utils";
import {
    addStatementToTargetLine,
    getContextBasedCompletions
} from "../../../utils/ls-utils";
import { ExpressionComponent } from "../../Expression";

interface BinaryProps {
    model: BinaryExpression;
    isElseIfMember: boolean;
}

export function BinaryExpressionComponent(props: BinaryProps) {
    const { model, isElseIfMember } = props;
    const stmtCtx = useContext(StatementEditorContext);

    const { expressionHandler } = useContext(SuggestionsContext);
    const {
        currentFile,
        getLangClient,
        formCtx: {
            formModelPosition : targetPosition
        }
    } = stmtCtx;
    const fileURI = `expr://${currentFile.path}`;

    const kind = getKindBasedOnOperator(model.operator.kind);

    const onClickOperator = (event: any) => {
        event.stopPropagation()
        expressionHandler(model.operator, true, false, {
            expressionSuggestions: getOperatorSuggestions(kind),
            typeSuggestions: [],
            variableSuggestions: []
        });
    }

    const onClickOnLhsExpression = async (event: any) => {
        event.stopPropagation();

        const content: string = await addStatementToTargetLine(
            currentFile.content, targetPosition, stmtCtx.modelCtx.statementModel.source, getLangClient);

        const completions: SuggestionItem[] = await getContextBasedCompletions(
            fileURI, content, targetPosition, model.lhsExpr.position,
            false, isElseIfMember, model.lhsExpr.source, getLangClient);

        expressionHandler(model.lhsExpr, false, false, {
            expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS),
            typeSuggestions: [],
            variableSuggestions: completions
        });
    };

    const onClickOnRhsExpression = async (event: any) => {
        event.stopPropagation();

        const content: string = await addStatementToTargetLine(
            currentFile.content, targetPosition, stmtCtx.modelCtx.statementModel.source, getLangClient);

        const completions: SuggestionItem[] = await getContextBasedCompletions(
            fileURI, content, targetPosition, model.rhsExpr.position,
            false, isElseIfMember, model.rhsExpr.source, getLangClient);

        expressionHandler(model.rhsExpr, false, false, {
            expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS),
            typeSuggestions: [],
            variableSuggestions: completions
        });
    };

    const lhs: ReactNode = (
        <ExpressionComponent
            model={model.lhsExpr}
            isElseIfMember={isElseIfMember}
            isTypeDescriptor={false}
            onSelect={onClickOnLhsExpression}
            deleteConfig={{defaultExprDeletable: true}}
        />
    );
    const rhs: ReactNode = (
        <ExpressionComponent
            model={model.rhsExpr}
            isElseIfMember={isElseIfMember}
            isTypeDescriptor={false}
            onSelect={onClickOnRhsExpression}
            deleteConfig={{defaultExprDeletable: true}}
        />
    );

    const operator: ReactNode = (
        <ExpressionComponent
            model={model.operator}
            isElseIfMember={isElseIfMember}
            isTypeDescriptor={false}
            onSelect={onClickOperator}
            classNames="operator"
        />
    );

    return (
        <span>
            {lhs}
            {operator}
            {rhs}
        </span>
    );
}
