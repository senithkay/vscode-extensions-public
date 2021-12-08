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
import { monaco } from "react-monaco-editor";

import { WhileStatement } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { DEFAULT_EXPRESSIONS } from "../../../constants";
import { SuggestionItem, VariableUserInputs } from "../../../models/definitions";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { SuggestionsContext } from "../../../store/suggestions-context";
import { getSuggestionsBasedOnExpressionKind, isPositionsEquals } from "../../../utils";
import { addStatementToTargetLine, getContextBasedCompletions } from "../../../utils/ls-utils";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../styles";

interface WhileStatementProps {
    model: WhileStatement;
    userInputs: VariableUserInputs;
    isElseIfMember: boolean;
    diagnosticHandler: (diagnostics: string) => void;
}

export function WhileStatementC(props: WhileStatementProps) {
    const { model, userInputs, isElseIfMember, diagnosticHandler } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const { modelCtx } = stmtCtx;
    const { currentModel } = modelCtx;
    const hasConditionSelected = currentModel.model &&
        isPositionsEquals(currentModel.model.position, model.condition.position);

    const statementEditorClasses = useStatementEditorStyles();
    const { expressionHandler } = useContext(SuggestionsContext);
    const { currentFile, getLangClient } = stmtCtx;
    const targetPosition = stmtCtx.formCtx.formModelPosition;

    const conditionComponent: ReactNode = (
        <ExpressionComponent
            model={model.condition}
            userInputs={userInputs}
            isElseIfMember={isElseIfMember}
            diagnosticHandler={diagnosticHandler}
            isTypeDescriptor={false}
        />
    );

    const onClickOnConditionExpression = async (event: any) => {
        event.stopPropagation();

        const content: string = await addStatementToTargetLine(
            currentFile.content, targetPosition, stmtCtx.modelCtx.statementModel.source, getLangClient);

        const completions: SuggestionItem[] = await getContextBasedCompletions(
            monaco.Uri.file(currentFile.path).toString(), content, targetPosition, model.condition.position,
            false, isElseIfMember, model.condition.source, getLangClient);

        expressionHandler(model.condition, false, false, {
            expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS),
            typeSuggestions: [],
            variableSuggestions: completions
        });
    };

    if (!currentModel.model) {
        addStatementToTargetLine(currentFile.content, targetPosition,
            stmtCtx.modelCtx.statementModel.source, getLangClient).then((content: string) => {
            getContextBasedCompletions(monaco.Uri.file(currentFile.path).toString(), content, targetPosition,
                model.condition.position, false, isElseIfMember, model.condition.source,
                getLangClient).then((completions) => {
                expressionHandler(model.condition, false, false, {
                    expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS),
                    typeSuggestions: [],
                    variableSuggestions: completions
                });
            });
        });
    }

    return (
        <span>
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled
                )}
            >
                {model.whileKeyword.value}
            </span>
            <button
                className={classNames(
                    statementEditorClasses.expressionElement,
                    hasConditionSelected && statementEditorClasses.expressionElementSelected
                )}
                onClick={onClickOnConditionExpression}
            >
                {conditionComponent}
            </button>
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled
                )}
            >
                &nbsp;{model.whileBody.openBraceToken.value}
                <br/>
                &nbsp;&nbsp;&nbsp;{"..."}
                <br/>
                {model.whileBody.closeBraceToken.value}
            </span>
        </span>
    );
}
