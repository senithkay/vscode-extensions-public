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
import React, {ReactNode, useContext} from "react";

import { AssignmentStatement } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { DEFAULT_EXPRESSIONS } from "../../../constants";
import { SuggestionItem } from "../../../models/definitions";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { SuggestionsContext } from "../../../store/suggestions-context";
import { getSuggestionsBasedOnExpressionKind } from "../../../utils";
import { addStatementToTargetLine, getContextBasedCompletions } from "../../../utils/ls-utils";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../styles";

interface AssignmentStatementProps {
    model: AssignmentStatement;
    isElseIfMember: boolean;
}

export function AssignmentStatementComponent(props: AssignmentStatementProps) {
    const { model, isElseIfMember } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const { modelCtx } = stmtCtx;
    const { currentModel } = modelCtx;

    const statementEditorClasses = useStatementEditorStyles();
    const { expressionHandler } = useContext(SuggestionsContext);
    const { currentFile, getLangClient } = stmtCtx;
    const targetPosition = stmtCtx.formCtx.formModelPosition;
    const fileURI = `expr://${currentFile.path}`;

    const onClickOnVarRef = async (event: any) => {
        event.stopPropagation();

        const content: string = await addStatementToTargetLine(
            currentFile.content, targetPosition, stmtCtx.modelCtx.statementModel.source, getLangClient);

        const completions: SuggestionItem[] = await getContextBasedCompletions(
            fileURI, content, targetPosition, model.varRef.position,
            false, isElseIfMember, model.varRef.source, getLangClient);

        expressionHandler(model.varRef, false, false, {
            expressionSuggestions: [],
            typeSuggestions: [],
            variableSuggestions: completions
        });
    };

    const onClickOnExpression = async (event: any) => {
        event.stopPropagation();

        const content: string = await addStatementToTargetLine(
            currentFile.content, targetPosition, stmtCtx.modelCtx.statementModel.source, getLangClient);

        const completions: SuggestionItem[] = await getContextBasedCompletions(
            fileURI, content, targetPosition, model.expression.position,
            false, isElseIfMember, model.expression.source, getLangClient);

        expressionHandler(model.expression, false, false, {
            expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS),
            typeSuggestions: [],
            variableSuggestions: completions
        });
    };

    if (!currentModel.model) {
        addStatementToTargetLine(currentFile.content, targetPosition,
            stmtCtx.modelCtx.statementModel.source, getLangClient).then((content: string) => {
            getContextBasedCompletions(fileURI, content, targetPosition, model.expression.position, false,
                isElseIfMember, model.expression.source, getLangClient,  currentFile.content).then((completions) => {
                expressionHandler(model.expression, false, false, {
                    expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS),
                    typeSuggestions: [],
                    variableSuggestions: completions
                });
            });
        });
    }

    const expression: ReactNode = (
        <ExpressionComponent
            model={model.expression}
            isElseIfMember={isElseIfMember}
            onSelect={onClickOnExpression}
        />
    );

    const varRef: ReactNode = (
        <ExpressionComponent
            model={model.varRef}
            isElseIfMember={isElseIfMember}
            onSelect={onClickOnVarRef}
            deleteConfig={{exprNotDeletable: true}}
        />
    );

    return (
        <span>
            {varRef}
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled,
                    "operator"
                )}
            >
                {model.equalsToken.value}
            </span>
            {expression}
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled
                )}
            >
                {model.semicolonToken.value}
            </span>
        </span>
    );
}
