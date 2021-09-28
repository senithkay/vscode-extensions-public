import React, {ReactNode} from "react";

import {STNode} from "@ballerina/syntax-tree"

import * as c from "../../../constants";
import {getSuggestionsBasedOnExpressionKind} from "../../../utils";
import {SuggestionItem} from "../../../utils/utils";
import {statementEditorStyles} from "../../ViewContainer/styles";

interface IfStatementProps {
    model: STNode
    callBack: (suggestions: SuggestionItem[], model: STNode, operator: boolean) => void
    isRoot: boolean
    component: ReactNode
}

export function IfStatement(props: IfStatementProps) {
    const {model, callBack, isRoot, component} = props;

    const overlayClasses = statementEditorStyles();

    const onClickOnRootExpression = (event: any) => {
        event.stopPropagation()
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
                    onClick={onClickOnRootExpression}
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
