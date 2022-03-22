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
// tslint:disable: jsx-wrap-multiline
import React from "react";

import { TemplateString } from "@wso2-enterprise/syntax-tree";

import { InputEditor, InputEditorProps } from "../../InputEditor";

interface TemplateStringProps {
    model: TemplateString;
    isTypeDesc?: boolean;
}

export function TemplateStringComponent(props: TemplateStringProps) {
    const { model, isTypeDesc } = props;

    const inputEditorProps: InputEditorProps = {
        model,
        isTypeDesc,
        isToken: true
    };

    return (
        <InputEditor {...inputEditorProps} />
    );
}
