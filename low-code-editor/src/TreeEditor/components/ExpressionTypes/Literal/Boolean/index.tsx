import React from "react";

import {BooleanLiteral, STNode} from "@ballerina/syntax-tree";

import * as c from "../../../../constants";
import {getSuggestionsBasedOnExpressionKind} from "../../../../utils";
import {SuggestionItem} from "../../../../utils/utils";

interface LiteralProps {
    model: STNode
    callBack: (suggestions: SuggestionItem[], model: STNode) => void
}

export function BooleanLiteralC(props: LiteralProps) {
    const {model, callBack} = props;
    let value: any;

    const onClickOnExpression = (event: any) => {
        event.stopPropagation()
        callBack(getSuggestionsBasedOnExpressionKind(c.LITERAL), model)
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
