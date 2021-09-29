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

import * as c from "../../../constants";
import {Expression} from "../../../models/definitions";
import {getSuggestionsBasedOnExpressionKind} from "../../../utils";
import {SuggestionItem} from "../../../utils/utils";
import {statementEditorStyles} from "../../ViewContainer/styles";

interface LiteralProps {
    model: Expression
    callBack: (suggestions: SuggestionItem[], model: Expression) => void
}

export function LiteralC(props: LiteralProps) {
    const overlayClasses = statementEditorStyles();
    const {model, callBack} = props;
    // let value: any;

    const onClickOnExpression = (event: any) => {
        event.stopPropagation()
        callBack(getSuggestionsBasedOnExpressionKind(c.LITERAL), model)
    };

    if (model.kind === c.LITERAL) {
        // const literalModel: Literal = model.expressionType as Literal;
        // value = literalModel?.value ? literalModel.value : "expression";
    }

    return (
        <span
            className={`${overlayClasses.AppExpressionBlock} ${overlayClasses.AppExpressionBlockElement}`}
        >
            <input
                type="text"
                id="literal"
                name="literal"
                onClick={onClickOnExpression}
                className="literal-input"
            />
        </span>
    );
}
