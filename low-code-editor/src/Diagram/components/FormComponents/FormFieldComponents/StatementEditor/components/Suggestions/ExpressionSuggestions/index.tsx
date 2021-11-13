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
// tslint:disable: jsx-no-multiline-js jsx-wrap-multiline jsx-no-lambda
import React, { useContext } from "react";

import { BinaryExpression, STKindChecker, STNode } from "@ballerina/syntax-tree";

import * as c from "../../../constants";
import { SuggestionItem } from "../../../models/definitions";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { generateExpressionTemplate } from "../../../utils/utils";
import { useStatementEditorStyles } from "../../ViewContainer/styles";

export interface ExpressionSuggestionsProps {
    model: STNode
    suggestions?: SuggestionItem[],
    operator: boolean,
    suggestionHandler: () => void
}

export function ExpressionSuggestions(props: ExpressionSuggestionsProps) {
    const overlayClasses = useStatementEditorStyles();
    const { model, suggestions, suggestionHandler } = props;

    const {
        modelCtx: {
            updateModel,
        }
    } = useContext(StatementEditorContext);

    const onClickExpressionSuggestion = (kind: string) => {
        updateModel(generateExpressionTemplate(kind), model.position);
        suggestionHandler();
    }

    const onClickOperatorSuggestion = (operator: SuggestionItem) => {
        if (STKindChecker.isBinaryExpression(model)) {
            updateModel(operator.value, model.operator.position);
            suggestionHandler();
        }
    }

    return (
        <div>
            {
                suggestions.map((suggestion: SuggestionItem, index: number) => (
                    (suggestion.kind) ?
                        (
                            <button
                                className={overlayClasses.suggestionButton}
                                key={index}
                                onClick={() => onClickOperatorSuggestion(suggestion)}
                            >
                                {suggestion.value}
                            </button>

                        )
                        :
                        (
                            <button
                                className={overlayClasses.suggestionButton}
                                key={index}
                                onClick={() => onClickExpressionSuggestion(suggestion.value)}
                            >
                                {suggestion.value}
                            </button>
                        )

                ))}
        </div>
    );
}
