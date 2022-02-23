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

import { FunctionCall, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { DEFAULT_EXPRESSIONS } from "../../../constants";
import { SuggestionItem, VariableUserInputs } from "../../../models/definitions";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { SuggestionsContext } from "../../../store/suggestions-context";
import { getSuggestionsBasedOnExpressionKind, isPositionsEquals } from "../../../utils";
import { addStatementToTargetLine, getContextBasedCompletions } from "../../../utils/ls-utils";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../styles";

interface FunctionCallProps {
    model: FunctionCall;
    userInputs: VariableUserInputs;
    isElseIfMember: boolean;
    diagnosticHandler: (diagnostics: string) => void;
}

export function FunctionCallComponent(props: FunctionCallProps) {
    const { model, userInputs, isElseIfMember, diagnosticHandler } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const { modelCtx } = stmtCtx;
    const { currentModel } = modelCtx;
    const hasFunctionCallExprSelected = currentModel.model &&
        isPositionsEquals(currentModel.model.position, model.position);

    const statementEditorClasses = useStatementEditorStyles();
    const { expressionHandler } = useContext(SuggestionsContext);
    const { currentFile, getLangClient } = stmtCtx;
    const targetPosition = stmtCtx.formCtx.formModelPosition;
    const fileURI = `expr://${currentFile.path}`;

    const functionName: ReactNode = (
        <ExpressionComponent
            model={model.functionName}
            userInputs={userInputs}
            isElseIfMember={isElseIfMember}
            diagnosticHandler={diagnosticHandler}
            isTypeDescriptor={false}
        />
    );

    const onClickOnFunctionCallExpr = async (event: any) => {
        event.stopPropagation();

        const content: string = await addStatementToTargetLine(
            currentFile.content, targetPosition, stmtCtx.modelCtx.statementModel.source, getLangClient);

        const completions: SuggestionItem[] = await getContextBasedCompletions(
            fileURI, content, targetPosition, model.position,
            false, isElseIfMember, model.source, getLangClient);

        expressionHandler(model, false, false, {
            expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS),
            typeSuggestions: [],
            variableSuggestions: completions
        });
    }

    const expressionComponent = (
        <span>
            {
                model.arguments.map((expression: STNode, index: number) => (
                    (STKindChecker.isCommaToken(expression)) ? (
                        <span
                            key={index}
                            className={classNames(
                                statementEditorClasses.expressionBlock,
                                statementEditorClasses.expressionBlockDisabled
                            )}
                        >
                            {expression.value}
                        </span>
                    ) : (
                        <ExpressionComponent
                            model={expression}
                            userInputs={userInputs}
                            isElseIfMember={isElseIfMember}
                            diagnosticHandler={diagnosticHandler}
                            isTypeDescriptor={false}
                        />
                    )
                ))
            }
        </span>
    );

    return (
        <span>
            <span
                className={classNames(
                    statementEditorClasses.expressionElement,
                    hasFunctionCallExprSelected && statementEditorClasses.expressionElementSelected
                )}
                onClick={onClickOnFunctionCallExpr}
            >
                {functionName}
                <span
                    className={classNames(
                        statementEditorClasses.expressionBlock,
                        statementEditorClasses.expressionBlockDisabled
                    )}
                >
                    {model.openParenToken.value}
                </span>
                {expressionComponent}
                <span
                    className={classNames(
                        statementEditorClasses.expressionBlock,
                        statementEditorClasses.expressionBlockDisabled
                    )}
                >
                    {model.closeParenToken.value}
                </span>
            </span>
        </span>
    );
}
