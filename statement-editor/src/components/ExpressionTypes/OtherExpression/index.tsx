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
import React from "react";

import { TextField } from "@material-ui/core";
import { STNode } from "@wso2-enterprise/syntax-tree";

import { useStatementEditorStyles } from "../../styles";

interface OtherExpressionProps {
    model: STNode
    diagnosticHandler: (diagnostics: string) => void
}

export function OtherExpressionComponent(props: OtherExpressionProps) {
    const { model } = props;

    const statementEditorClasses = useStatementEditorStyles();

    return (
        <TextField
            className={statementEditorClasses.expressionElement}
            autoFocus={true}
            defaultValue={model.source.trim()}
        />
    );
}
