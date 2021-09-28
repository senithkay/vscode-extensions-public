import React from "react";

import {NumericLiteral, STNode} from "@ballerina/syntax-tree";

import * as c from "../../../../constants";
import {getSuggestionsBasedOnExpressionKind} from "../../../../utils";
import {SuggestionItem} from "../../../../utils/utils";

interface LiteralProps {
    model: STNode
    callBack: (suggestions: SuggestionItem[], model: STNode) => void
}

export function NumericLiteralC(props: LiteralProps) {
    const {model, callBack} = props;
    let literalModel: NumericLiteral;
    let value: any;

    if (model.kind === "NumericLiteral") {
        literalModel = model as NumericLiteral;
        value = literalModel.literalToken.value;
    }

    const onClickOnExpression = (event: any) => {
        event.stopPropagation()
        callBack(getSuggestionsBasedOnExpressionKind(c.LITERAL), literalModel.literalToken)
    };

    return (
        <span className="App-expression-block App-expression-block-element">
            {/* <input type="text" id="literal" name="literal" onClick={(e) => onClickOnExpression(e)} className="literal-input"></input> */}
            <button className="template-button" onClick={onClickOnExpression}>
                {value}
            </button>
        </span>
    );
}
