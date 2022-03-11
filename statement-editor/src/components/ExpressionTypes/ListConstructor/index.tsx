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
// tslint:disable: jsx-no-multiline-js jsx-no-lambda
import React, { useContext } from "react";

import { ListConstructor, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { APPEND_EXPR_LIST_CONSTRUCTOR, DEFAULT_EXPRESSIONS, INIT_EXPR_LIST_CONSTRUCTOR } from "../../../constants";
import { SuggestionItem } from "../../../models/definitions";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { SuggestionsContext } from "../../../store/suggestions-context";
import { getSuggestionsBasedOnExpressionKind } from "../../../utils";
import { addStatementToTargetLine, getContextBasedCompletions } from "../../../utils/ls-utils";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../styles";

interface ListConstructorProps {
    model: ListConstructor;
    isElseIfMember: boolean;
}

export function ListConstructorComponent(props: ListConstructorProps) {
    const { model, isElseIfMember } = props;
    const {
        modelCtx: {
            statementModel,
            updateModel,
        },
        currentFile,
        formCtx: {
            formModelPosition
        },
        getLangClient
    } = useContext(StatementEditorContext);
    const fileURI = `expr://${currentFile.path}`;

    const statementEditorClasses = useStatementEditorStyles();
    const { expressionHandler } = useContext(SuggestionsContext);

    const onClickOnExpression = async (clickedExpression: STNode, event: any) => {
        event.stopPropagation();
        const content: string = await addStatementToTargetLine(
            currentFile.content, formModelPosition, statementModel.source, getLangClient);

        const completions: SuggestionItem[] = await getContextBasedCompletions(
            fileURI, content, formModelPosition, clickedExpression.position,
            false, isElseIfMember, clickedExpression.source, getLangClient);
        expressionHandler(clickedExpression, false, {
            expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS),
            typeSuggestions: [],
            variableSuggestions: completions
        });
    };

    const expressionComponent = (
        <span>
            {
                model.expressions.map((expression: STNode, index: number) => (
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
                            key={index}
                            model={expression}
                            isElseIfMember={isElseIfMember}
                            onSelect={(event) => onClickOnExpression(expression, event)}
                            deleteConfig={{defaultExprDeletable: true}}
                        />
                    )
                ))
            }
        </span>
    );

    const onClickOnPlusIcon = (event: any) => {
        event.stopPropagation();
        const newExpression = model.expressions.length !== 0 ? APPEND_EXPR_LIST_CONSTRUCTOR : INIT_EXPR_LIST_CONSTRUCTOR;
        updateModel(newExpression, model.closeBracket.position);
    };

    return (
        <span>
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled
                )}
            >
                {model.openBracket.value}
            </span>
            {expressionComponent}
            <span
                className={statementEditorClasses.plusIcon}
                onClick={onClickOnPlusIcon}
            >
                +
            </span>
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled
                )}
            >
                {model.closeBracket.value}
            </span>
        </span>
    );
}
