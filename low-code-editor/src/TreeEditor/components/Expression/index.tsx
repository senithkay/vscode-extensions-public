import React from "react";

import * as c from "../../constants";
import {Expression} from "../../models/definitions";
import {getExpressionTypeComponent, getSuggestionsBasedOnExpressionKind} from "../../utils";
import {statementEditorStyles} from "../ViewContainer/styles";

interface ExpressionComponentProps {
    model: Expression
    callBack: (suggestions: string[], model: Expression, operator: boolean) => void
    isRoot: boolean
}
export function ExpressionComponent(props: ExpressionComponentProps) {
    const overlayClasses = statementEditorStyles();
    const {model, callBack, isRoot} = props;

    const component = getExpressionTypeComponent(model, callBack);

    const onClickOnRootExpression = (expressionModel: Expression, e: any) => {
        e.stopPropagation()
        callBack(getSuggestionsBasedOnExpressionKind(c.DEFAULT_BOOL), expressionModel, false)
    };

    return (
        <span>
            {
                isRoot ?
                    <span className={`${overlayClasses.AppExpressionBlock} ${overlayClasses.AppExpressionBlockDisabled}`}>
                        {"if"}
                    </span> : null
            }
            {
                isRoot ?
                    <button
                        className={overlayClasses.AppTemplateButton}
                        onClick={(e) => onClickOnRootExpression(model, e)}
                    >
                        {component}
                    </button> :
                    <span>
                        {component}
                    </span>
            }
            {
                isRoot ?
                    <span className={`${overlayClasses.AppExpressionBlock} ${overlayClasses.AppExpressionBlockDisabled}`}>
                        &nbsp;{"{"}
                        <br/>
                        &nbsp;&nbsp;&nbsp;{"..."}
                        <br/>
                        {"} "}
                        <button className={overlayClasses.AppAddNewExpressionButton}> + </button>
                        {" else {"}
                        <br/>
                        &nbsp;&nbsp;&nbsp;{"..."}
                        <br/>
                        {"}"}
                    </span> : null
            }
        </span>
    );
}
