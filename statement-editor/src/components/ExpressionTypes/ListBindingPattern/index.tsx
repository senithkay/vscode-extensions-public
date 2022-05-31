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
// tslint:disable: jsx-no-multiline-js
import React from "react";

import { ListBindingPattern } from "@wso2-enterprise/syntax-tree";

import { getMinutiaeJSX } from "../../../utils";
import { StatementEditorViewState } from "../../../utils/statement-editor-viewstate";
import { InputEditor } from "../../InputEditor";

interface ListBindingPatternProps {
    model: ListBindingPattern;
}

export function ListBindingPatternComponent(props: ListBindingPatternProps) {
    const { model } = props;

    const inputEditorProps = {
        model
    };

    const { leadingMinutiaeJSX, trailingMinutiaeJSX } = getMinutiaeJSX(model);

    const isFieldWithNewLine = (model.viewState as StatementEditorViewState).multilineConstructConfig.isFieldWithNewLine;

    return (
        <>
            {leadingMinutiaeJSX}
            <InputEditor {...inputEditorProps} />
            {!isFieldWithNewLine && trailingMinutiaeJSX}
        </>
    );
}
