/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import { RemoteMethodCallAction, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { DEFAULT_EXPRESSIONS } from "../../../constants";
import { SuggestionItem, VariableUserInputs } from "../../../models/definitions";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { SuggestionsContext } from "../../../store/suggestions-context";
import { getSuggestionsBasedOnExpressionKind } from "../../../utils";
import { addStatementToTargetLine, getContextBasedCompletions } from "../../../utils/ls-utils";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../styles";

interface RemoteMethodCallActionProps {
    model: RemoteMethodCallAction;
    userInputs: VariableUserInputs;
    isElseIfMember: boolean;
}

export function RemoteMethodCallActionComponent(props: RemoteMethodCallActionProps) {
    const { model, userInputs, isElseIfMember } = props;
    const stmtCtx = useContext(StatementEditorContext);

    const statementEditorClasses = useStatementEditorStyles();
    const { expressionHandler } = useContext(SuggestionsContext);
    const { currentFile, getLangClient } = stmtCtx;
    const targetPosition = stmtCtx.formCtx.formModelPosition;
    const fileURI = `expr://${currentFile.path}`;

    const expressionArgComponent = (
        <span>
            { model.arguments.length > 0 &&
                (model.arguments.map((argument: STNode, index: number) => (
                    (STKindChecker.isCommaToken(argument)) ? (
                        <span
                            key={index}
                            className={classNames(
                                statementEditorClasses.expressionBlock,
                                statementEditorClasses.expressionBlockDisabled
                            )}
                        >
                            {argument.value}
                        </span>
                    ) : (
                        <ExpressionComponent
                            model={argument}
                            userInputs={userInputs}
                            isElseIfMember={isElseIfMember}
                            isTypeDescriptor={false}
                        />
                    )
                ))
                )
            }
        </span>
    );

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

    const onClickOnMethodName = async (event: any) => {
        event.stopPropagation();

        const content: string = await addStatementToTargetLine(
            currentFile.content, targetPosition, stmtCtx.modelCtx.statementModel.source, getLangClient);

        const completions: SuggestionItem[] = await getContextBasedCompletions(
            fileURI, content, targetPosition, model.methodName.position,
            false, isElseIfMember, model.methodName.source, getLangClient);

        expressionHandler(model.methodName, false, false, {
            expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS),
            typeSuggestions: [],
            variableSuggestions: completions
        });
    };

    const methodName: ReactNode = (
        <ExpressionComponent
            model={model.methodName}
            userInputs={userInputs}
            isElseIfMember={isElseIfMember}
            isTypeDescriptor={false}
            onSelect={onClickOnMethodName}
        >
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled
                )}
            >
                {model.openParenToken.value}
            </span>
            {expressionArgComponent}
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled
                )}
            >
                {model.closeParenToken.value}
            </span>
        </ExpressionComponent>
    );

    const expression: ReactNode = (
        <ExpressionComponent
            model={model.expression}
            userInputs={userInputs}
            isElseIfMember={isElseIfMember}
            isTypeDescriptor={false}
            onSelect={onClickOnExpression}
        />
    );

    return (
        <span>
            {expression}
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled,
                    "operator"
                )}
            >
                {model.rightArrowToken.value}
            </span>
            {methodName}
        </span>
    );
}
