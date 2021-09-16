import React, {ReactNode} from "react";

import * as c from "../../../constants";
import {Expression} from "../../../models/definitions";
import {getSuggestionsBasedOnExpressionKind} from "../../../utils";
import {statementEditorStyles} from "../../ViewContainer/styles";

interface VariableStatementProps {
    model: Expression
    callBack: (suggestions: string[], model: Expression, operator: boolean) => void
    isRoot: boolean
    component: ReactNode
}

export function VariableStatement(props: VariableStatementProps) {
    const {model, callBack, isRoot, component} = props;

    const overlayClasses = statementEditorStyles();

    const onClickOnRootExpression = (model: Expression, e: any) => {
        e.stopPropagation()
        callBack(getSuggestionsBasedOnExpressionKind(c.DEFAULT_BOOL), model, false) // Need to change this to get suggestions for variable
    };

    return (
        isRoot ? (
            <span>
                <span className={`${overlayClasses.AppExpressionBlock} ${overlayClasses.AppExpressionBlockDisabled}`}>
                    {"var x = "}
                </span>
                <button
                    className={overlayClasses.AppTemplateButton}
                    onClick={(e) => onClickOnRootExpression(model, e)}
                >
                    {component}
                </button>
                <span className={`${overlayClasses.AppExpressionBlock} ${overlayClasses.AppExpressionBlockDisabled}`}>
                    {" ;"}
                </span>
            </span>
        ) : <span>{component}</span>
    );
}
