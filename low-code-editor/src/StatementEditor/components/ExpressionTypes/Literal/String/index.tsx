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
import React, { useContext, useRef, useState } from "react";

import { STNode, StringLiteral, traversNode } from "@ballerina/syntax-tree";

import * as c from "../../../../constants";
import { ModelContext } from "../../../../store/model-context";
import { SuggestionItem } from "../../../../utils/utils";
import { statementEditorStyles } from "../../../ViewContainer/styles";
import { InputEditor } from "../../../InputEditor";

interface LiteralProps {
    model: STNode
    callBack: (suggestions: SuggestionItem[], model: STNode, operator: boolean) => void,
    diagnosticHandler: (diagnostics: string) => void
}

export function StringLiteralC(props: LiteralProps) {
    const overlayClasses = statementEditorStyles();
    const { model, callBack, diagnosticHandler } = props;
    const ctx = useContext(ModelContext);

    const inputEditorProps = {
        statementType: model.kind,
        model,
        callBack,
        diagnosticHandler
    };

    return (
        <InputEditor {...inputEditorProps} />
    );
}
