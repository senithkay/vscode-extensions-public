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

import { STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { getJSXForMinutiae } from "../../utils";
import { StatementEditorViewState } from "../../utils/statement-editor-viewstate";
import { useStatementRendererStyles } from "../styles";

export interface TokenComponentProps {
    model: STNode;
    className?: string;
    onPlusClick?: (evt: any) => void;
}

export function TokenComponent(props: TokenComponentProps) {
    const { model, className, onPlusClick } = props;

    const statementRendererClasses = useStatementRendererStyles();

    const styleClassName = classNames(
        statementRendererClasses.expressionBlock,
        statementRendererClasses.expressionBlockDisabled,
        className
    );

    const mappingConstructorConfig = (model.viewState as StatementEditorViewState).multilineConstructConfig;
    const newLineRequired = mappingConstructorConfig.isClosingBraceWithNewLine;
    const isFieldWithNewLine = mappingConstructorConfig.isFieldWithNewLine;

    const leadingMinutiaeJSX = getJSXForMinutiae(model.leadingMinutiae, isFieldWithNewLine);
    const trailingMinutiaeJSX = getJSXForMinutiae(model.trailingMinutiae, isFieldWithNewLine);

    return (
        <span className={styleClassName} >
            {STKindChecker.isCloseBraceToken(model) && newLineRequired && <br/>}
            {leadingMinutiaeJSX}
            {model.value}
            {onPlusClick && (
                <span
                    className={statementRendererClasses.plusIcon}
                    onClick={onPlusClick}
                >
                +
                </span>
            )}
            {trailingMinutiaeJSX}
        </span>
    );
}
