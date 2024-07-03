/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { Expression } from "../../utils/types";
import { TextEditor } from "./TextEditor";
import { ClientEditor } from "./ClientEditor";

export interface EditorProps {
    expression : Expression;
    parentId: string;
    index: number;
    onChange: (expression: Expression) => void;
}

export function generateEditor(key: string, expression: Expression, parentId: string, index: number, handleOnChange: (expression: Expression) => void) {
     const props: EditorProps = { expression, index, parentId, onChange: handleOnChange };
    if (expression.typeKind == "BTYPE" && expression.type == "http:Client") {
        return (<ClientEditor {...props} />)
    }
    return (<TextEditor {...props} />);
}
