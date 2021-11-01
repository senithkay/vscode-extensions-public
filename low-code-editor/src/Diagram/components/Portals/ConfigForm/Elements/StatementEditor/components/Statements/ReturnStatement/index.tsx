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
import React, { ReactNode, useContext } from "react";

import { ReturnStatement } from "@ballerina/syntax-tree";

import * as c from "../../../constants";
import { VariableUserInputs } from "../../../models/definitions";
import { SuggestionsContext } from "../../../store/suggestions-context";
import { getSuggestionsBasedOnExpressionKind } from "../../../utils";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../ViewContainer/styles";


interface ReturnStatementProps {
    model: ReturnStatement
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
}

export function ReturnStatementC(props: ReturnStatementProps) {
    const { model, userInputs, diagnosticHandler } = props;

    const overlayClasses = useStatementEditorStyles();
    const { expressionHandler } = useContext(SuggestionsContext);

    const expressionComponent: ReactNode = (
        <ExpressionComponent
            model={model.expression}
            isRoot={false}
            userInputs={userInputs}
            diagnosticHandler={diagnosticHandler}
        />
    );


    const onClickOnExpression = (event: any) => {
        event.stopPropagation()
        expressionHandler(model.expression, false,
            { expressionSuggestions: getSuggestionsBasedOnExpressionKind(model.expression.kind) })
    };

    const onClickOnRoot = (event: any) => {
        event.stopPropagation()
        expressionHandler(model.expression, false,
            { expressionSuggestions: getSuggestionsBasedOnExpressionKind(c.DEFAULT_RETURN) })
    };

    return (
        <span>
            <span className={`${overlayClasses.expressionBlock} ${overlayClasses.expressionBlockDisabled}`}>
                {model.returnKeyword.value}
            </span>
            <span className={overlayClasses.rootElement} onClick={onClickOnRoot}>
                <button className={overlayClasses.expressionElement} style={{ margin: '3px 3px 3px 3px' }} onClick={onClickOnExpression}>
                    {expressionComponent}
                </button>
            </span>
            <span className={`${overlayClasses.expressionBlock} ${overlayClasses.expressionBlockDisabled}`}>
                &nbsp;{model.semicolonToken.value}
            </span>

        </span>
    );
}
