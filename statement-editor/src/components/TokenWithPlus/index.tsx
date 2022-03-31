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

import { CommaToken, STNode } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { getJSXForMinutiae } from "../../utils";
import {PlusButton} from "../Button/PlusButton";
import { useStatementEditorStyles } from "../styles";

export interface TokenComponentProps {
    model: STNode;
    className?: string;
    plusHandler?: (model: STNode) => void;
}

export function TokenWithPlus(props: TokenComponentProps) {
    const { model, className, plusHandler } = props;

    const statementEditorClasses = useStatementEditorStyles();

    const styleClassName = classNames(
        statementEditorClasses.expressionBlock,
        statementEditorClasses.expressionBlockDisabled,
        className
    );

    const leadingMinutiae = getJSXForMinutiae(model.leadingMinutiae);
    const trailingMinutiae = getJSXForMinutiae(model.trailingMinutiae);

    return (
        <span className={styleClassName} >
            {leadingMinutiae}
            {model.value}
            <PlusButton model={model} plusHandler={plusHandler} />
            {trailingMinutiae}
        </span>
    );
}
