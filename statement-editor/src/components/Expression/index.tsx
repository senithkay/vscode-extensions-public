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

import { STNode } from "@wso2-enterprise/syntax-tree";
import cn from "classnames";

import { VariableUserInputs } from "../../models/definitions";
import { getExpressionTypeComponent } from "../../utils";

export interface ExpressionComponentProps {
    model: STNode;
    userInputs?: VariableUserInputs;
    isElseIfMember: boolean;
    diagnosticHandler: (diagnostics: string) => void;
    isTypeDescriptor: boolean;
}

export function ExpressionComponent(props: ExpressionComponentProps) {
    const { model, userInputs, isElseIfMember, diagnosticHandler, isTypeDescriptor } = props;

    const component = getExpressionTypeComponent(model, userInputs, isElseIfMember, diagnosticHandler, isTypeDescriptor);

    const [isHovered, setHovered] = React.useState(false);

    const onMouseOver = (e: React.MouseEvent) => {
        setHovered(true);
        e.stopPropagation();
        e.preventDefault();
    }

    const onMouseOut = (e: React.MouseEvent) => {
        setHovered(false);
        e.stopPropagation();
        e.preventDefault();
    }

    return (
        <span onMouseOver={onMouseOver} onMouseOut={onMouseOut} className={cn({ "hovered": isHovered })}>{component}</span>
    );
}
