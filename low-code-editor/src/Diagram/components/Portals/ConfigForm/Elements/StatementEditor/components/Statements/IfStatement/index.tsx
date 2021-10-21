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

import { IfElseStatement } from "@ballerina/syntax-tree"

import { VariableUserInputs } from "../../../models/definitions";
import { SuggestionsContext } from "../../../store/suggestions-context";
import { getSuggestionsBasedOnExpressionKind } from "../../../utils";
import { ExpressionComponent } from "../../Expression";
import { statementEditorStyles } from "../../ViewContainer/styles";

interface IfStatementProps {
    model: IfElseStatement
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
}

export function IfStatementC(props: IfStatementProps) {
    const { model, userInputs, diagnosticHandler } = props;

    const overlayClasses = statementEditorStyles();
    const suggestionCtx = useContext(SuggestionsContext);

    const conditionComponent: ReactNode = (
        <ExpressionComponent
            model={model.condition}
            isRoot={false}
            userInputs={userInputs}
            diagnosticHandler={diagnosticHandler}
        />
    );


    const onClickOnConditionExpression = (event: any) => {
        event.stopPropagation()
        suggestionCtx.expressionHandler(model.condition, false,
            { expressionSuggestions: getSuggestionsBasedOnExpressionKind(model.condition.kind) })
    };

    return (
        <span>
            <span className={`${overlayClasses.expressionBlock} ${overlayClasses.expressionBlockDisabled}`}>
                {model.ifKeyword.value}
            </span>
             <button className={overlayClasses.expressionElement} onClick={onClickOnConditionExpression}>
                {conditionComponent}
            </button>
            <span className={`${overlayClasses.expressionBlock} ${overlayClasses.expressionBlockDisabled}`}>
                &nbsp;{model.ifBody.openBraceToken.value}
                <br/>
                &nbsp;&nbsp;&nbsp;{"..."}
                <br/>
                &nbsp;{model.ifBody.closeBraceToken.value}
            </span>
            <button className={overlayClasses.addNewExpressionButton}> + </button>
            <span className={`${overlayClasses.expressionBlock} ${overlayClasses.expressionBlockDisabled}`}>
                &nbsp;{model.elseBody.elseKeyword.value}
                &nbsp;{model.ifBody.openBraceToken.value}
                <br/>
                &nbsp;&nbsp;&nbsp;{"..."}
                <br/>
                &nbsp;{model.ifBody.closeBraceToken.value}
            </span>
        </span>
    );
}
