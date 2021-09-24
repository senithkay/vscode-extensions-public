import React, {ReactNode} from "react";

import {STNode} from "@ballerina/syntax-tree";

import * as c from "../../../constants";
import {getSuggestionsBasedOnExpressionKind} from "../../../utils";
import {statementEditorStyles} from "../../ViewContainer/styles";

interface VariableStatementProps {
    model: STNode
    callBack: (suggestions: string[], model: STNode, operator: boolean) => void
    isRoot: boolean
    component: ReactNode
}

export function VariableStatement(props: VariableStatementProps) {
    const {model, callBack, isRoot, component} = props;

    const overlayClasses = statementEditorStyles();

    const onClickOnRootExpression = (event: any) => {
        event.stopPropagation()
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
                    onClick={onClickOnRootExpression}
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
