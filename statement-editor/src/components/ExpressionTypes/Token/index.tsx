/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React from "react";

import {
    AsteriskToken,
    BooleanKeyword,
    DecimalFloatingPointLiteralToken,
    DecimalIntegerLiteralToken,
    DecimalKeyword,
    FalseKeyword,
    FloatKeyword,
    FunctionKeyword,
    IdentifierToken,
    IntKeyword,
    JsonKeyword,
    NullKeyword,
    StringKeyword,
    StringLiteralToken,
    TemplateString,
    TrueKeyword,
    VarKeyword
} from "@wso2-enterprise/syntax-tree";

import { getClassNameForToken, getMinutiaeJSX } from "../../../utils";
import { StatementEditorViewState } from "../../../utils/statement-editor-viewstate";
import { InputEditor } from "../../InputEditor";

interface TokenProps {
    model: AsteriskToken
        | FalseKeyword
        | TrueKeyword
        | NullKeyword
        | FunctionKeyword
        | DecimalFloatingPointLiteralToken
        | DecimalIntegerLiteralToken
        | StringLiteralToken
        | BooleanKeyword
        | DecimalKeyword
        | FloatKeyword
        | IntKeyword
        | JsonKeyword
        | StringKeyword
        | VarKeyword
        | IdentifierToken
        | TemplateString;
}

export function TokenComponent(props: TokenProps) {
    const { model } = props;

    const inputEditorProps = {
        model,
        classNames: getClassNameForToken(model)
    };

    const { leadingMinutiaeJSX, trailingMinutiaeJSX } = getMinutiaeJSX(model);

    const isLastMapField = (model.viewState as StatementEditorViewState).mappingConstructorConfig.isLastMapField;

    return (
        <>
            {leadingMinutiaeJSX}
            <InputEditor {...inputEditorProps} />
            {!isLastMapField && trailingMinutiaeJSX}
        </>
    );
}
