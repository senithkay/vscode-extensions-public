import React, {useState} from "react";

import {STNode, traversNode} from "@ballerina/syntax-tree";

import {getSuggestionsBasedOnExpressionKind} from "../../utils";
// import {Operator} from "../../utils/utils";
import {ExpressionComponent} from '../Expression';
import {Suggestions} from '../Suggestions';
import {statementEditorStyles} from "../ViewContainer/styles";
import {visitor as CodeGenVisitor} from "../Visitors/codeGenVisitor";


interface ModelProps {
    model: STNode,
    kind: string,
    label: string,
    currentModel: { model: STNode }
}

export function LeftPane(props: ModelProps) {
    const overlayClasses = statementEditorStyles();
    const {model, kind, label, currentModel} = props;

    const [suggestionList, setSuggestionsList] = useState(getSuggestionsBasedOnExpressionKind(kind));
    const [isSuggestionClicked, setIsSuggestionClicked] = useState(false);
    const [isOperator, setIsOperator] = useState(false);

    const onClickExpressionButton = (suggestions: string[], cModel: STNode, operator: boolean) => {
        currentModel.model = cModel
        setSuggestionsList(suggestions)
        setIsSuggestionClicked(false)
        setIsOperator(operator)
    }

    const onClickSuggestionButton = () => {
        setIsSuggestionClicked(prevState => {
            return !prevState;
        });
    }

    CodeGenVisitor.clearShapeList();
    traversNode(model, CodeGenVisitor);

    console.log(CodeGenVisitor.getCodeSnippet());

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
