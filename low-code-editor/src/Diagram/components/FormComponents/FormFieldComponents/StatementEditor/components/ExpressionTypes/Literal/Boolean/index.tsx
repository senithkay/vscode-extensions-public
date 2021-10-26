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
import React, { useContext } from "react";

import { BooleanLiteral } from "@ballerina/syntax-tree";

import { VariableUserInputs } from "../../../../models/definitions";
import { SuggestionsContext } from "../../../../store/suggestions-context";
import { getSuggestionsBasedOnExpressionKind } from "../../../../utils";
import { useStatementEditorStyles } from "../../../ViewContainer/styles";

interface BooleanLiteralProps {
    model: BooleanLiteral
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
}

export function BooleanLiteralC(props: BooleanLiteralProps) {
    const { model } = props;

    const overlayClasses = useStatementEditorStyles();
    const { expressionHandler } = useContext(SuggestionsContext);

    const onClickOnBooleanLiteral = (event: any) => {
        event.stopPropagation()
        expressionHandler(model, false,
            { expressionSuggestions: getSuggestionsBasedOnExpressionKind(model.kind) })
    };

    return (
        <button className={overlayClasses.expressionElement} onClick={onClickOnBooleanLiteral}>
            {model.literalToken.value}
        </button>
    );
}
