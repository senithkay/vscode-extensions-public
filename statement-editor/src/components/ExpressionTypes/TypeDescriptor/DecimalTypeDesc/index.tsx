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
// tslint:disable: jsx-wrap-multiline
import React, { useContext } from "react";

import { DecimalTypeDesc } from "@ballerina/syntax-tree";

import { VariableUserInputs } from "../../../../models/definitions";
import { SuggestionsContext } from "../../../../store/suggestions-context";
import { getTypeDescriptors } from "../../../../utils";
import { InputEditor } from "../../../InputEditor";
import { useStatementEditorStyles } from "../../../ViewContainer/styles";

interface DecimalTypeDescProps {
    model: DecimalTypeDesc
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
    isTypeDescriptor: boolean
}

export function DecimalTypeDescComponent(props: DecimalTypeDescProps) {
    const { model, userInputs, diagnosticHandler, isTypeDescriptor} = props;

    const overlayClasses = useStatementEditorStyles();
    const { expressionHandler } = useContext(SuggestionsContext);

    const inputEditorProps = {
        statementType: model.kind,
        model,
        expressionHandler,
        userInputs,
        diagnosticHandler,
        isTypeDescriptor
    };

    const onClickOnType = (event: any) => {
        event.stopPropagation()
        expressionHandler(model, false, true, { typeSuggestions: getTypeDescriptors() })
    };

    return (
        <button
            className={overlayClasses.expressionElement}
            onClick={onClickOnType}
        >
            <InputEditor {...inputEditorProps} />
        </button>
    );
}
