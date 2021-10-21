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

import { ForeachStatement } from "@ballerina/syntax-tree";

import { VariableUserInputs } from "../../../models/definitions";
import { SuggestionsContext } from "../../../store/suggestions-context";
import { getSuggestionsBasedOnExpressionKind } from "../../../utils";
import { ExpressionComponent } from "../../Expression";
import { statementEditorStyles } from "../../ViewContainer/styles";

interface ForeachStatementProps {
    model: ForeachStatement
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
}

export function ForeachStatementC(props: ForeachStatementProps) {
    const { model, userInputs, diagnosticHandler } = props;

    const overlayClasses = statementEditorStyles();
    const suggestionCtx = useContext(SuggestionsContext);

    const typedBindingComponent: ReactNode = (
        <ExpressionComponent
            model={model.typedBindingPattern}
            isRoot={false}
            userInputs={userInputs}
            diagnosticHandler={diagnosticHandler}
        />
    );

    const actionOrExprComponent: ReactNode = (
        <ExpressionComponent
            model={model.actionOrExpressionNode}
            isRoot={false}
            userInputs={userInputs}
            diagnosticHandler={diagnosticHandler}
        />
    );


    const onClickOnActionOrExpr = (event: any) => {
        event.stopPropagation()
        suggestionCtx.expressionHandler(model.actionOrExpressionNode, false,
            { expressionSuggestions: getSuggestionsBasedOnExpressionKind(model.actionOrExpressionNode.kind) })
    };

    return (
        <span>
            <span className={`${overlayClasses.expressionBlock} ${overlayClasses.expressionBlockDisabled}`}>
                {model.forEachKeyword.value}
            </span>
            <button className={overlayClasses.expressionElement}>
                {typedBindingComponent}
            </button>
            <span className={`${overlayClasses.expressionBlock} ${overlayClasses.expressionBlockDisabled}`}>
                &nbsp;{model.inKeyword.value}
            </span>
            <button className={overlayClasses.expressionElement} onClick={onClickOnActionOrExpr}>
                {actionOrExprComponent}
            </button>
            <span className={`${overlayClasses.expressionBlock} ${overlayClasses.expressionBlockDisabled}`}>
                &nbsp;{model.blockStatement.openBraceToken.value}
                <br/>
                &nbsp;&nbsp;&nbsp;{"..."}
                <br/>
                {model.blockStatement.closeBraceToken.value}
            </span>
        </span>
    );
}
