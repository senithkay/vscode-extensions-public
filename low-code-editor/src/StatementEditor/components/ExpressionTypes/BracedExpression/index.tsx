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
import React from "react";

import { BracedExpression, STNode } from "@ballerina/syntax-tree";

import { SuggestionItem, VariableUserInputs } from "../../../models/definitions";
import { ExpressionComponent } from "../../Expression";

interface BracedExprProps {
    model: STNode
    callBack: (suggestions: SuggestionItem[], model: STNode, operator: boolean) => void
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
}

export function BracedExpressionC(props: BracedExprProps) {
    const { model, callBack, userInputs, diagnosticHandler } = props;
    let expression: any;
    let expressionComponent: any;

    if (model.kind === 'BracedExpression') {
        const bracedExpModel = model as BracedExpression;
        expression = bracedExpModel.expression;
        expressionComponent = <ExpressionComponent
            model={expression}
            callBack={callBack}
            isRoot={false}
            userInputs={userInputs}
            diagnosticHandler={diagnosticHandler}
        />;
    }

    return (
        <span>
            {expressionComponent}
        </span>
    );
}
