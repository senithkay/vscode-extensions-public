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

import { ForeachStatement } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { DEFAULT_EXPRESSIONS } from "../../../constants";
import { SuggestionItem, VariableUserInputs } from "../../../models/definitions";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { SuggestionsContext } from "../../../store/suggestions-context";
import { getSuggestionsBasedOnExpressionKind, isPositionsEquals } from "../../../utils";
import { addStatementToTargetLine, getContextBasedCompletions } from "../../../utils/ls-utils";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../styles";

interface ForeachStatementProps {
    model: ForeachStatement;
    userInputs: VariableUserInputs;
    isElseIfMember: boolean;
    diagnosticHandler: (diagnostics: string) => void;
}

export function ForeachStatementC(props: ForeachStatementProps) {
    const { model, userInputs, isElseIfMember, diagnosticHandler } = props;

    const stmtCtx = useContext(StatementEditorContext);
    const { modelCtx } = stmtCtx;
    const { currentModel } = modelCtx;
    const hasTypedBindingPatternSelected = currentModel.model &&
        isPositionsEquals(currentModel.model.position, model.typedBindingPattern.position);
    const hasExprComponentSelected = currentModel.model &&
        isPositionsEquals(currentModel.model.position, model.actionOrExpressionNode.position);

    const statementEditorClasses = useStatementEditorStyles();
    const { expressionHandler } = useContext(SuggestionsContext);
    const { currentFile, getLangClient } = stmtCtx;
    const targetPosition = stmtCtx.formCtx.formModelPosition;
    const fileURI = `expr://${currentFile.path}`;

    const typedBindingComponent: ReactNode = (
        <ExpressionComponent
            model={model.typedBindingPattern}
            userInputs={userInputs}
            isElseIfMember={isElseIfMember}
            diagnosticHandler={diagnosticHandler}
            isTypeDescriptor={false}
        />
    );

    const actionOrExprComponent: ReactNode = (
        <ExpressionComponent
            model={model.actionOrExpressionNode}
            userInputs={userInputs}
            isElseIfMember={isElseIfMember}
            diagnosticHandler={diagnosticHandler}
            isTypeDescriptor={false}
        />
    );

    const onClickOnBindingPattern = (event: any) => {
        event.stopPropagation();
        expressionHandler(model.typedBindingPattern, false, false,
            {expressionSuggestions: [], typeSuggestions: [], variableSuggestions: []});
    };

    const onClickOnActionOrExpr = async (event: any) => {
        event.stopPropagation();

        const content: string = await addStatementToTargetLine(
            currentFile.content, targetPosition, stmtCtx.modelCtx.statementModel.source, getLangClient);

        const completions: SuggestionItem[] = await getContextBasedCompletions(fileURI, content, targetPosition,
            model.actionOrExpressionNode.position, false, isElseIfMember,
            model.actionOrExpressionNode.source, getLangClient);

        expressionHandler(model.actionOrExpressionNode, false, false, {
            expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS),
            typeSuggestions: [],
            variableSuggestions: completions
        });
    };

    if (!currentModel.model) {
        addStatementToTargetLine(currentFile.content, targetPosition,
            stmtCtx.modelCtx.statementModel.source, getLangClient).then((content: string) => {
            getContextBasedCompletions(fileURI, content, targetPosition, model.actionOrExpressionNode.position,
                false, isElseIfMember, model.actionOrExpressionNode.source,
                getLangClient, currentFile.content).then((completions) => {
                expressionHandler(model.actionOrExpressionNode, false, false, {
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
                {model.forEachKeyword.value}
            </span>
            <span
                className={classNames(
                    statementEditorClasses.expressionElement,
                    hasTypedBindingPatternSelected && statementEditorClasses.expressionElementSelected
                )}
                onClick={onClickOnBindingPattern}
            >
                {typedBindingComponent}
            </span>
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled
                )}
            >
                &nbsp;{model.inKeyword.value}
            </span>
            <span
                className={classNames(
                    statementEditorClasses.expressionElement,
                    hasExprComponentSelected && statementEditorClasses.expressionElementSelected
                )}
                onClick={onClickOnActionOrExpr}
            >
                {actionOrExprComponent}
            </span>
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled
                )}
            >
                &nbsp;{model.blockStatement.openBraceToken.value}
                <br/>
                &nbsp;&nbsp;&nbsp;{"..."}
                <br/>
                {model.blockStatement.closeBraceToken.value}
            </span>
        </span>
    );
}
