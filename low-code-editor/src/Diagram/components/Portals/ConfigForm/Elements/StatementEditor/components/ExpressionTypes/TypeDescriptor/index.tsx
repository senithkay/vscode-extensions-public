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
import React, {ReactNode} from "react";

import {STKindChecker, STNode, StringTypeDesc, TypedBindingPattern} from "@ballerina/syntax-tree";

import { VariableUserInputs } from "../../../models/definitions";
import { ExpressionComponent } from "../../Expression";
import { statementEditorStyles } from "../../ViewContainer/styles";

interface StringTypeDescProps {
    model: STNode
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
}

export function StringTypeDescC(props: StringTypeDescProps) {
    const { model, userInputs, diagnosticHandler } = props;

    const overlayClasses = statementEditorStyles();

    let name: string;

    if (STKindChecker.isStringTypeDesc(model)) {
        const stringTypeDescModel = model as StringTypeDesc;
        name = stringTypeDescModel.name.value;
    }

    return (
        <button
            className={overlayClasses.expressionElement}
        >
            {name}
        </button>
    );
}
