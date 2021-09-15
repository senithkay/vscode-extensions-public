import React from "react";

import * as c from "../../../constants";
import {Expression, Literal} from "../../../models/definitions";
import {getSuggestionsBasedOnExpressionKind} from "../../../utils";
import {statementEditorStyles} from "../../ViewContainer/styles";

interface LiteralProps {
    model: Expression
    callBack: (suggestions: string[], model: Expression) => void
}

export function LiteralC(props: LiteralProps) {
    const overlayClasses = statementEditorStyles();
    const {model, callBack} = props;
    let value: any;

    const onClickOnExpression = (e: any) => {
        e.stopPropagation()
        callBack(getSuggestionsBasedOnExpressionKind(c.LITERAL), model)
    };

    if (model.kind === c.LITERAL) {
        const literalModel: Literal = model.expressionType as Literal;
        value = literalModel?.value ? literalModel.value : "expression";
    }

    return (
        <span
            className={`${overlayClasses.AppExpressionBlock} ${overlayClasses.AppExpressionBlockElement}`}
        >
            <input
                type="text"
                id="literal"
                name="literal"
                onClick={(e) => onClickOnExpression(e)}
                className="literal-input"
            />
        </span>
    );
}
