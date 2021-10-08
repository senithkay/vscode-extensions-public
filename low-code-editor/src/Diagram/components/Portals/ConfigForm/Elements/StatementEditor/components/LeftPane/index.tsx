/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import React, { useState } from "react";

import { STNode } from "@ballerina/syntax-tree";

import { SuggestionItem, VariableUserInputs } from "../../models/definitions";
import { getSuggestionsBasedOnExpressionKind } from "../../utils";
import { Diagnostics } from "../Diagnostics";
import { ExpressionComponent } from '../Expression';
import { ExpressionSuggestions } from "../Suggestions/ExpressionSuggestions";
import { VariableSuggestions } from "../Suggestions/VariableSuggestions";
import { statementEditorStyles } from "../ViewContainer/styles";

interface ModelProps {
    model: STNode,
    kind: string,
    label: string,
    currentModel: { model: STNode },
    userInputs?: VariableUserInputs
}

export function LeftPane(props: ModelProps) {
    const overlayClasses = statementEditorStyles();
    const { model, kind, label, currentModel, userInputs } = props;

    const [suggestionList, setSuggestionsList] = useState(getSuggestionsBasedOnExpressionKind(kind));
    const [diagnosticList, setDiagnostic] = useState("");
    const [, setIsSuggestionClicked] = useState(false);
    const [isOperator, setIsOperator] = useState(false);
    const [variableList, setVariableList] = useState([]);

    const expressionHandler = (cModel: STNode, operator: boolean, variableSuggestions?: SuggestionItem[], suggestions?: SuggestionItem[]) => {
        currentModel.model = cModel
        if (suggestions) {
            setSuggestionsList(suggestions)
        }
        setIsSuggestionClicked(false)
        setIsOperator(operator)
        if (variableSuggestions) {
            setVariableList(variableSuggestions)
        }
    }

    const suggestionHandler = () => {
        setIsSuggestionClicked(prevState => {
            return !prevState;
        });
    }

    const diagnosticHandler = (diagnostics: string) => {
        setDiagnostic(diagnostics)
    }

    return (
        <div className={overlayClasses.leftPane}>
            <span className={overlayClasses.subHeader}>{label}</span>
            <div className={overlayClasses.templateEditor}>
                <div className={overlayClasses.templateEditorInner}>
                    <ExpressionComponent
                        model={model}
                        expressionHandler={expressionHandler}
                        isRoot={true}
                        userInputs={userInputs}
                        diagnosticHandler={diagnosticHandler}
                    />
                </div>
            </div>
            <div className={overlayClasses.leftPaneDivider}/>
            <div className={overlayClasses.diagnosticsPane}>
                <Diagnostics
                    message={diagnosticList}
                />
            </div>
            <span className={overlayClasses.subHeader}>Variables</span>
            <div className={overlayClasses.contextSensitivePane}>
                <VariableSuggestions
                    model={currentModel.model}
                    variableSuggestions={variableList}
                    suggestionHandler={suggestionHandler}
                />
            </div>
            <span className={overlayClasses.subHeader}>Expression</span>
            <div className={overlayClasses.contextSensitivePane}>
                <ExpressionSuggestions
                    model={currentModel.model}
                    suggestions={suggestionList}
                    operator={isOperator}
                    suggestionHandler={suggestionHandler}
                />
            </div>

        </div>
    );
}
