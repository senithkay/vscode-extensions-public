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
// tslint:disable: ordered-imports
import React, { useState } from "react";

import { STNode } from "@ballerina/syntax-tree";

import {getSuggestionsBasedOnExpressionKind} from "../../utils";
import {SuggestionItem} from "../../utils/utils";
import {ExpressionComponent} from '../Expression';
import {Suggestions} from '../Suggestions';
import {statementEditorStyles} from "../ViewContainer/styles";
import { variableUserInputs } from "../../models/definitions";
import { Diagnostics } from "../Diagnostics";

interface ModelProps {
    model: STNode,
    kind: string,
    label: string,
    currentModel: { model: STNode },
    userInputs?: variableUserInputs
}

export function LeftPane(props: ModelProps) {
    const overlayClasses = statementEditorStyles();
    const {model, kind, label, currentModel, userInputs} = props;

    const [suggestionList, setSuggestionsList] = useState(getSuggestionsBasedOnExpressionKind(kind));
    const [diagnosticList, setDiagnostic] = useState("");
    const [, setIsSuggestionClicked] = useState(false);
    const [isOperator, setIsOperator] = useState(false);

    const onClickExpressionButton = (suggestions: SuggestionItem[], cModel: STNode, operator: boolean) => {
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

    const diagnosticHandler = (diagnostics: string) => {
        setDiagnostic(diagnostics)
    }

    return (
        <div className={overlayClasses.AppLeftPane}>
            <h3 className={overlayClasses.AppLeftPaneHeading}>{label}</h3>
            <div className={overlayClasses.AppStatementTemplateEditor}>
                <div className={overlayClasses.AppStatementTemplateEditorInner}>
                    <ExpressionComponent model={model} callBack={onClickExpressionButton} isRoot={true} userInputs={userInputs} diagnosticHandler={diagnosticHandler}/>
                </div>
            </div>
            <div className={overlayClasses.AppDiagnosticsPane}>
                <Diagnostics message={diagnosticList} />
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
