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
import React from "react";

import { STNode } from "@ballerina/syntax-tree";

import { SuggestionItem } from "../../../../utils/utils";
import { InputEditor } from "../../../InputEditor";
import { VariableUserInputs } from "../../../../models/definitions";

interface LiteralProps {
    model: STNode
    callBack: (suggestions: SuggestionItem[], model: STNode, operator: boolean) => void;
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
}

export function NumericLiteralC(props: LiteralProps) {
    const { model, callBack, userInputs, diagnosticHandler } = props;
    console.log("=============NUMERIC-LITERAL", userInputs.variableExpression)
    const inputEditorProps = {
        statementType: model.kind,
        model,
        callBack,
        userInputs,
        diagnosticHandler
    };

    return (
        <InputEditor {...inputEditorProps} />
    );
}
