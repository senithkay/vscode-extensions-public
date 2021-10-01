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
import React from "react";

import { BooleanLiteral, STNode } from "@ballerina/syntax-tree";

import * as c from "../../../../constants";
import { getSuggestionsBasedOnExpressionKind } from "../../../../utils";
import { SuggestionItem } from "../../../../utils/utils";
import { VariableUserInputs } from "../../../../models/definitions";

interface LiteralProps {
    model: STNode
    callBack: (suggestions: SuggestionItem[], model: STNode) => void
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
}

export function BooleanLiteralC(props: LiteralProps) {
    const { model, callBack } = props;
    let value: any;

    const onClickOnExpression = (event: any) => {
        event.stopPropagation()
        callBack(getSuggestionsBasedOnExpressionKind(c.STRING_LITERAL), model)
    };

    if (model.kind === "BooleanLiteral") {
        const literalModel: BooleanLiteral = model as BooleanLiteral;
        value = literalModel.literalToken.value;
    }

    return (
        <span className="App-expression-block App-expression-block-element">
            {/* <input type="text" id="literal" name="literal" onClick={(e) => onClickOnExpression(e)} className="literal-input"></input> */}
            <button className="template-button" onClick={onClickOnExpression}>
                {value}
            </button>
        </span>
    );
}
