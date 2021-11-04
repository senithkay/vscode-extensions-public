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
// tslint:disable: jsx-wrap-multiline
import React, { ReactNode, useContext } from "react";

import { ConditionalExpression } from "@ballerina/syntax-tree";

import { DEFAULT_EXPRESSIONS } from "../../../constants";
import { VariableUserInputs } from "../../../models/definitions";
import { SuggestionsContext } from "../../../store/suggestions-context";
import { getSuggestionsBasedOnExpressionKind } from "../../../utils";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../ViewContainer/styles";

interface ConditionalExpressionProps {
    model: ConditionalExpression
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
}

export function ConditionalExpressionComponent(props: ConditionalExpressionProps) {
    const { model, userInputs, diagnosticHandler } = props;

    const overlayClasses = useStatementEditorStyles();
    const { expressionHandler } = useContext(SuggestionsContext);

    const lhsExpression: ReactNode = <ExpressionComponent
        model={model.lhsExpression}
        isRoot={false}
        userInputs={userInputs}
        diagnosticHandler={diagnosticHandler}
    />;

    const middleExpression: ReactNode = <ExpressionComponent
        model={model.middleExpression}
        isRoot={false}
        userInputs={userInputs}
        diagnosticHandler={diagnosticHandler}
    />;

    const endExpression: ReactNode = <ExpressionComponent
        model={model.endExpression}
        isRoot={false}
        userInputs={userInputs}
        diagnosticHandler={diagnosticHandler}
    />;

    const onClickOnLhsExpression = (event: any) => {
        event.stopPropagation()
        expressionHandler(model.lhsExpression, true, { expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS) })
    }

    const onClickOnMiddleExpression = (event: any) => {
        event.stopPropagation()
        expressionHandler(model.middleExpression, false, { expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS) })
    };

    const onClickOnEndExpression = (event: any) => {
        event.stopPropagation()
        expressionHandler(model.endExpression, false, { expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS) })
    };


    return (
        <span>
            <button
                className={overlayClasses.expressionElement}
                onClick={onClickOnLhsExpression}
            >
                {lhsExpression}
            </button>
            <span className={`${overlayClasses.expressionBlock} ${overlayClasses.expressionBlockDisabled}`}>
                &nbsp;{model.questionMarkToken.value}
            </span>
            <button
                className={overlayClasses.expressionElement}
                onClick={onClickOnMiddleExpression}
            >
                {middleExpression}
            </button>
            <span className={`${overlayClasses.expressionBlock} ${overlayClasses.expressionBlockDisabled}`}>
                &nbsp;{model.colonToken.value}
            </span>
            <button
                className={overlayClasses.expressionElement}
                onClick={onClickOnEndExpression}
            >
                {endExpression}
            </button>

        </span>
    );
}
