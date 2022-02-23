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

import { STNode } from "@wso2-enterprise/syntax-tree";

import { SuggestionItem } from "../../../models/definitions";
import { InputEditorContext } from "../../../store/input-editor-context";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { generateExpressionTemplate } from "../../../utils/utils";
import { useStatementEditorStyles } from "../../styles";

export interface ExpressionSuggestionsProps {
    model: STNode;
    suggestions?: SuggestionItem[];
    operator: boolean;
    suggestionHandler: () => void;
    isExpression: boolean;
}

export function ExpressionSuggestions(props: ExpressionSuggestionsProps) {
    const statementEditorClasses = useStatementEditorStyles();
    const { model, suggestions, suggestionHandler, operator, isExpression } = props;
    const inputEditorCtx = useContext(InputEditorContext);

    const {
        modelCtx: {
            updateModel,
        }
    } = useContext(StatementEditorContext);

    const onClickExpressionSuggestion = (kind: string) => {
        updateModel(generateExpressionTemplate(kind), model.position);
        inputEditorCtx.onInputChange('');
        suggestionHandler();
    }

    const onClickOperatorSuggestion = (operatorSuggestion: SuggestionItem) => {
        updateModel(operatorSuggestion.value, model.position);
        suggestionHandler();
    }

    const label = operator ? "Operators" : "Expressions";

    return (
        <>
            { isExpression && (
                <>
                    <div className={statementEditorClasses.subHeader}>{label}</div>
                    {
                        suggestions.map((suggestion: SuggestionItem, index: number) => (
                            (suggestion.kind) ?
                                (
                                    <button
                                        className={statementEditorClasses.suggestionButton}
                                        key={index}
                                        onClick={() => onClickOperatorSuggestion(suggestion)}
                                    >
                                        {suggestion.value}
                                    </button>

                                )
                                :
                                (
                                    <button
                                        className={statementEditorClasses.suggestionButton}
                                        key={index}
                                        onClick={() => onClickExpressionSuggestion(suggestion.value)}
                                    >
                                        {suggestion.value}
                                    </button>
                                )

                        ))
                    }
                </>
            )}
        </>
    );
}
