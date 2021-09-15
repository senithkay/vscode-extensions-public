import React, { useState } from "react";

import { statementEditorStyles } from "../ViewContainer/styles";


// interface ModelProps {
//     model: Expression
//     currentModel: { model: Expression }
// }

export function LeftPane() {
    const overlayClasses = statementEditorStyles();
    // const { model, currentModel } = props;

    // const [suggestionList, SetSuggestionsList] = useState(getSuggestionsBasedOnExpressionKind(c.DEFAULT_BOOL));
    // const [isSuggestionClicked, SetIsSuggestionClicked] = useState(false);
    // const [isOperator, SetIsOperator] = useState(false);

    // const onClickExpressionButton = (suggestions: string[], model: Expression, operator: boolean) => {
    //     currentModel.model = model
    //     SetSuggestionsList(suggestions)
    //     SetIsSuggestionClicked(false)
    //     SetIsOperator(operator)
    // }
    //
    // const onClickSuggestionButton = (model: Expression) => {
    //     currentModel.model = model
    //     SetIsSuggestionClicked(!isSuggestionClicked)
    // }


    return (
        <div className={overlayClasses.AppLeftPane}>
            <h3 className={overlayClasses.AppLeftPaneHeading}>Variable Statement</h3>
            <div className={overlayClasses.AppStatementTemplateEditor}>
                <div className={overlayClasses.AppStatementTemplateEditorInner}>
                    {/*<ExpressionComponent model={model} callBack={onClickExpressionButton} isRoot={true} />*/}
                </div>
            </div>
            <div className={overlayClasses.AppContextSensitivePane}>
                {/*<Suggestions model={currentModel.model} suggestions={suggestionList} operator={isOperator} callBack={onClickSuggestionButton} />*/}
            </div>

        </div>
    );
}
