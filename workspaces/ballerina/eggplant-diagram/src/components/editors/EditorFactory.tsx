/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { Property } from "../../utils/types";
import { TextEditor } from "./TextEditor";
import { ClientEditor } from "./ClientEditor";

export interface EditorProps {
    property : Property;
    parentId: string;
    index: number;
    onChange: (expression: Property) => void;
}

export function generateEditor(key: string, property: Property, parentId: string, index: number, handleOnChange: (property: Property) => void) {
     const props: EditorProps = { property, index, parentId, onChange: handleOnChange };
    if (property.valueType == "BTYPE") {
        return (<ClientEditor {...props} />)
    }
    return (<TextEditor {...props} />);
}
