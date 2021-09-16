import React, {useState} from "react";

import * as c from "../../constants";
import {Expression} from "../../models/definitions";
import {getSuggestionsBasedOnExpressionKind} from "../../utils";
import {ExpressionComponent} from '../Expression';
import {Suggestions} from '../Suggestions';
import {statementEditorStyles} from "../ViewContainer/styles";


interface ModelProps {
    model: Expression
    currentModel: { model: Expression }
}

export function LeftPane(props: ModelProps) {
    const overlayClasses = statementEditorStyles();
    const {model, currentModel} = props;

    const [suggestionList, setSuggestionsList] = useState(getSuggestionsBasedOnExpressionKind(c.DEFAULT_BOOL));
    const [isSuggestionClicked, setIsSuggestionClicked] = useState(false);
    const [isOperator, setIsOperator] = useState(false);

    const onClickExpressionButton = (suggestions: string[], exprModel: Expression, operator: boolean) => {
        currentModel.model = exprModel
        setSuggestionsList(suggestions)
        setIsSuggestionClicked(false)
        setIsOperator(operator)
    }

    const onClickSuggestionButton = (exprModel: Expression) => {
        setIsSuggestionClicked((prevState) => {
            return (!prevState);
        });
    }

    return (
        <div className={overlayClasses.AppLeftPane}>
            <h3 className={overlayClasses.AppLeftPaneHeading}>Variable Statement</h3>
            <div className={overlayClasses.AppStatementTemplateEditor}>
                <div className={overlayClasses.AppStatementTemplateEditorInner}>
                    <ExpressionComponent model={model} callBack={onClickExpressionButton} isRoot={true}/>
                </div>
            </div>
            <div className={overlayClasses.AppContextSensitivePane}>
                <Suggestions
                    model={currentModel.model}
                    suggestions={suggestionList}
                    operator={isOperator}
                    callBack={onClickSuggestionButton}
                />
            </div>

        </div>
    );
}
