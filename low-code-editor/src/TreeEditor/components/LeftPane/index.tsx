import React, {useState} from "react";

import * as c from "../../constants";
import {Expression} from "../../models/definitions";
import {getSuggestionsBasedOnExpressionKind} from "../../utils";
import {ExpressionComponent} from '../Expression';
import {Suggestions} from '../Suggestions';
import {statementEditorStyles} from "../ViewContainer/styles";


interface ModelProps {
    model: Expression,
    kind: string,
    label: string,
    currentModel: { model: Expression }
}

export function LeftPane(props: ModelProps) {
    const overlayClasses = statementEditorStyles();
    const {model, kind, label, currentModel} = props;

    const [suggestionList, setSuggestionsList] = useState(getSuggestionsBasedOnExpressionKind(kind));
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
            <h3 className={overlayClasses.AppLeftPaneHeading}>{label}</h3>
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
