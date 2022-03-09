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

import { ConditionalExpression } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { DEFAULT_EXPRESSIONS } from "../../../constants";
import { SuggestionItem, VariableUserInputs } from "../../../models/definitions";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { SuggestionsContext } from "../../../store/suggestions-context";
import { getSuggestionsBasedOnExpressionKind } from "../../../utils";
import { addStatementToTargetLine, getContextBasedCompletions } from "../../../utils/ls-utils";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../styles";

interface ConditionalExpressionProps {
    model: ConditionalExpression;
    userInputs: VariableUserInputs;
    isElseIfMember: boolean;
}

export function ConditionalExpressionComponent(props: ConditionalExpressionProps) {
    const { model, userInputs, isElseIfMember } = props;
    const stmtCtx = useContext(StatementEditorContext);

    const statementEditorClasses = useStatementEditorStyles();
    const { expressionHandler } = useContext(SuggestionsContext);
    const { currentFile, getLangClient } = stmtCtx;
    const targetPosition = stmtCtx.formCtx.formModelPosition;
    const fileURI = `expr://${currentFile.path}`;

    const onClickOnLhsExpression = async (event: any) => {
        event.stopPropagation();

        const content: string = await addStatementToTargetLine(
            currentFile.content, targetPosition, stmtCtx.modelCtx.statementModel.source, getLangClient);

        const completions: SuggestionItem[] = await getContextBasedCompletions(
            fileURI, content, targetPosition, model.lhsExpression.position,
            false, isElseIfMember, model.lhsExpression.source, getLangClient);

        expressionHandler(model.lhsExpression, false, false, {
            expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS),
            typeSuggestions: [],
            variableSuggestions: completions
        });
    }

    const onClickOnMiddleExpression = async (event: any) => {
        event.stopPropagation();

        const content: string = await addStatementToTargetLine(
            currentFile.content, targetPosition, stmtCtx.modelCtx.statementModel.source, getLangClient);

        const completions: SuggestionItem[] = await getContextBasedCompletions(
            fileURI, content, targetPosition, model.middleExpression.position,
            false, isElseIfMember, model.middleExpression.source, getLangClient);

        expressionHandler(model.middleExpression, false, false, {
            expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS),
            typeSuggestions: [],
            variableSuggestions: completions
        });
    };

    const onClickOnEndExpression = async (event: any) => {
        event.stopPropagation();

        const content: string = await addStatementToTargetLine(
            currentFile.content, targetPosition, stmtCtx.modelCtx.statementModel.source, getLangClient);

        const completions: SuggestionItem[] = await getContextBasedCompletions(
            fileURI, content, targetPosition, model.endExpression.position,
            false, isElseIfMember, model.endExpression.source, getLangClient);

        expressionHandler(model.endExpression, false, false, {
            expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS),
            typeSuggestions: [],
            variableSuggestions: completions
        });
    };

    const lhsExpression: ReactNode = (
        <ExpressionComponent
            model={model.lhsExpression}
            userInputs={userInputs}
            isElseIfMember={isElseIfMember}
            isTypeDescriptor={false}
            onSelect={onClickOnLhsExpression}
        />
    );

    const middleExpression: ReactNode = (
        <ExpressionComponent
            model={model.middleExpression}
            userInputs={userInputs}
            isElseIfMember={isElseIfMember}
            isTypeDescriptor={false}
            onSelect={onClickOnMiddleExpression}
        />
    );

    const endExpression: ReactNode = (
        <ExpressionComponent
            model={model.endExpression}
            userInputs={userInputs}
            isElseIfMember={isElseIfMember}
            isTypeDescriptor={false}
            onSelect={onClickOnEndExpression}
        />
    );

    return (
        <span>
            {lhsExpression}
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled,
                    "operator"
                )}
            >
                &nbsp;{model.questionMarkToken.value}
            </span>
            {middleExpression}
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled,
                    "operator"
                )}
            >
                &nbsp;{model.colonToken.value}
            </span>
            {endExpression}
        </span>
    );
}
