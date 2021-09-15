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

    const [suggestionList, SetSuggestionsList] = useState(getSuggestionsBasedOnExpressionKind(c.DEFAULT_BOOL));
    const [isSuggestionClicked, SetIsSuggestionClicked] = useState(false);
    const [isOperator, SetIsOperator] = useState(false);

    const onClickExpressionButton = (suggestions: string[], exprModel: Expression, operator: boolean) => {
        currentModel.model = exprModel
        SetSuggestionsList(suggestions)
        SetIsSuggestionClicked(false)
        SetIsOperator(operator)
    }

    const onClickSuggestionButton = (modelForSuggestion: Expression) => {
        currentModel.model = modelForSuggestion
        SetIsSuggestionClicked(!isSuggestionClicked)
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
