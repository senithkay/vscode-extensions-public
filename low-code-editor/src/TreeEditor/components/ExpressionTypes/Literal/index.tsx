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
