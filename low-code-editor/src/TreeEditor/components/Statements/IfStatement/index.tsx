import React, {ReactNode} from "react";

import * as c from "../../../constants";
import {Expression} from "../../../models/definitions";
import {getSuggestionsBasedOnExpressionKind} from "../../../utils";
import {statementEditorStyles} from "../../ViewContainer/styles";

interface IfStatementProps {
    model: Expression
    callBack: (suggestions: string[], model: Expression, operator: boolean) => void
    isRoot: boolean
    component: ReactNode
}

export function IfStatement(props: IfStatementProps) {
    const {model, callBack, isRoot, component} = props;

    const overlayClasses = statementEditorStyles();

    const onClickOnRootExpression = (model: Expression, e: any) => {
        e.stopPropagation()
        callBack(getSuggestionsBasedOnExpressionKind(c.DEFAULT_BOOL), model, false)
    };

    return (
        isRoot ? (
            <span>
                <span className={`${overlayClasses.AppExpressionBlock} ${overlayClasses.AppExpressionBlockDisabled}`}>
                    {"if"}
                </span>
                <button
                    className={overlayClasses.AppTemplateButton}
                    onClick={(e) => onClickOnRootExpression(model, e)}
                >
                    {component}
                </button>
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
                </span>
            </span>
        ) : <span>{component}</span>
    );
}
