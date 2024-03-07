/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { TextField } from "@wso2-enterprise/ui-toolkit";
import { Expression } from "../../utils/types";

interface TextEditorProps {
    expression: Expression;
    onChange: (expression: Expression) => void;
}

export function TextEditor(props: TextEditorProps) {
    const { expression, onChange } = props;

    const handleOnChange = (value: string) => {
        onChange({ ...expression, value });
    };

    return (
        <TextField value={expression.value ? expression.value.toString() : ""} onChange={handleOnChange} />
    );
}
