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
// tslint:disable: jsx-no-multiline-js
import React, { useContext, useState } from "react";

import { STNode } from "@ballerina/syntax-tree";

import * as c from "../../constants";
import { SuggestionItem, VariableUserInputs } from "../../models/definitions";
import { StatementEditorContext } from "../../store/statement-editor-context";
import { SuggestionsContext } from "../../store/suggestions-context";
import { getSuggestionsBasedOnExpressionKind } from "../../utils";
import { Diagnostics } from "../Diagnostics";
import { StatementRenderer } from "../StatementRenderer";
import { ExpressionSuggestions } from "../Suggestions/ExpressionSuggestions";
import { TypeSuggestions } from "../Suggestions/TypeSuggestions";
import { VariableSuggestions } from "../Suggestions/VariableSuggestions";
import { useStatementEditorStyles } from "../ViewContainer/styles";

interface ModelProps {
    label: string,
    currentModel: { model: STNode },
    userInputs?: VariableUserInputs
    currentModelHandler: (model: STNode) => void
}

export function LeftPane(props: ModelProps) {
    const overlayClasses = useStatementEditorStyles();
    const { label, currentModel, userInputs, currentModelHandler } = props;

    const { modelCtx } = useContext(StatementEditorContext);

    const [suggestionList, setSuggestionsList] = useState(getSuggestionsBasedOnExpressionKind(c.DEFAULT_EXPRESSIONS));
    const [diagnosticList, setDiagnostic] = useState("");
    const [, setIsSuggestionClicked] = useState(false);
    const [isOperator, setIsOperator] = useState(false);
    const [variableList, setVariableList] = useState([]);
    const [typeDescriptorList, setTypeDescriptorList] = useState([]);
    const [isTypeDescSuggestion, setIsTypeDescSuggestion] = useState(false);

    const expressionHandler = (
            cModel: STNode,
            operator: boolean,
            isTypeDesc: boolean,
            suggestionsList: {
                variableSuggestions?: SuggestionItem[],
                expressionSuggestions?: SuggestionItem[],
                typeSuggestions?: SuggestionItem[]
            }) => {
        currentModelHandler(cModel);
        if (suggestionsList.expressionSuggestions) {
            setSuggestionsList(suggestionsList.expressionSuggestions);
        }
        if (suggestionsList.variableSuggestions) {
            setVariableList(suggestionsList.variableSuggestions);
        }
        if (suggestionsList.typeSuggestions) {
            setTypeDescriptorList(suggestionsList.typeSuggestions);
        }

        setIsTypeDescSuggestion(isTypeDesc);
        setIsSuggestionClicked(false);
        setIsOperator(operator);
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
            <SuggestionsContext.Provider
                value={{
                    expressionHandler
                }}
            >
                <span className={overlayClasses.subHeader}>{label}</span>
                <div className={overlayClasses.templateEditor}>
                    <div className={overlayClasses.templateEditorInner}>
                        <StatementRenderer
                            model={modelCtx.statementModel}
                            userInputs={userInputs}
                            diagnosticHandler={diagnosticHandler}
                        />
                    </div>
                </div>
            </SuggestionsContext.Provider>
            <div className={overlayClasses.leftPaneDivider}/>
            <div className={overlayClasses.diagnosticsPane}>
                <Diagnostics
                    message={diagnosticList}
                />
            </div>
            <div className={overlayClasses.contextSensitivePane}>
                {
                    (!isTypeDescSuggestion && variableList.length > 0) && (
                        <div className={overlayClasses.variableSuggestionsInner}>
                            <VariableSuggestions
                                model={currentModel.model}
                                variableSuggestions={variableList}
                                suggestionHandler={suggestionHandler}
                            />
                        </div>
                    )
                }
                {
                    (!isTypeDescSuggestion && suggestionList.length > 0) && (
                        <ExpressionSuggestions
                            model={currentModel.model}
                            suggestions={suggestionList}
                            operator={isOperator}
                            suggestionHandler={suggestionHandler}
                        />
                    )
                }
                {
                    isTypeDescSuggestion && (
                        <TypeSuggestions
                            model={currentModel.model}
                            typeSuggestions={typeDescriptorList}
                            suggestionHandler={suggestionHandler}
                        />
                    )
                }
            </div>
        </div>
    );
}
