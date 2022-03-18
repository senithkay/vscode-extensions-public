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

import { AsteriskToken,
    BitwiseAndToken,
    BitwiseXorToken,
    DoubleDotLtToken,
    DoubleEqualToken,
    EllipsisToken,
    ElvisToken,
    GtEqualToken,
    GtToken,
    LogicalAndToken,
    LogicalOrToken,
    LtEqualToken,
    LtToken,
    NotDoubleEqualToken,
    NotEqualToken,
    PercentToken,
    PipeToken,
    PlusToken,
    SlashToken,
    TrippleEqualToken } from "@wso2-enterprise/syntax-tree";

import { InputEditor } from "../../InputEditor";

export interface OperatorProps {
    model:  AsteriskToken |
            BitwiseAndToken |
            BitwiseXorToken |
            DoubleDotLtToken |
            DoubleEqualToken |
            EllipsisToken |
            ElvisToken |
            GtEqualToken |
            GtToken |
            LogicalAndToken |
            LogicalOrToken |
            LtEqualToken |
            LtToken |
            NotDoubleEqualToken |
            NotEqualToken |
            PercentToken |
            PipeToken |
            PlusToken |
            SlashToken |
            TrippleEqualToken;
}

export function OperatorComponent(props: OperatorProps) {
    const { model } = props;

    const inputEditorProps = {
        model,
        isToken: true,
        classNames: "operator"
    };

    return (
        <InputEditor {...inputEditorProps} />
    );
}
