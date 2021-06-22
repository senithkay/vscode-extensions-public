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

import React, { ReactNode } from "react";
import { useIntl } from "react-intl";

import { FormHelperText } from "@material-ui/core";

import { useStyles as useFormStyles } from "../../forms/style";

export enum HintType {
    ADD_CHECK,
    ADD_DOUBLE_QUOTES,
    ADD_DOUBLE_QUOTES_EMPTY
}

interface ExpressionEditorHintProps {
    onClickHere: () => void;
    type: HintType;
}

export function ExpressionEditorHint(props: ExpressionEditorHintProps) {
    const { type, onClickHere } = props;

    const formClasses = useFormStyles();
    const intl = useIntl();

    const clickHereText = intl.formatMessage({
        id: "lowcode.develop.elements.expressionEditor.invalidSourceCode.errorMessage.clickHere.text",
        defaultMessage: "Click here"
    })

    const expressionHasError = intl.formatMessage({
        id: "lowcode.develop.elements.expressionEditor.expressionError.errorMessage",
        defaultMessage: "This expression could cause an error. "
    })

    const toHandleItText = intl.formatMessage({
        id: "lowcode.develop.elements.expressionEditor.invalidSourceCode.errorMessage.toHandleIt.text",
        defaultMessage: " to handle it"
    })

    const addDoubleQuotes = intl.formatMessage({
        id: "lowcode.develop.elements.expressionEditor.invalidSourceCode.errorMessage.addDoubleQuotes.text",
        defaultMessage: " to convert the expression to a string"
    })

    const addDoubleQuotesToEmptyExpr = intl.formatMessage({
        id: "lowcode.develop.elements.expressionEditor.invalidSourceCode.errorMessage.addDoubleQuotesToEmptyExpr.text",
        defaultMessage: " to make an empty string"
    })

    let component: ReactNode;
    switch (type) {
        case HintType.ADD_CHECK: {
            component = (
                <div className={formClasses.suggestionsWrapper} >
                    <img className={formClasses.suggestionsIcon} src="../../../../../../images/console-error.svg" />
                    <FormHelperText className={formClasses.suggestionsText}>
                        {expressionHasError}
                        {<a className={formClasses.suggestionsTextInfo} onClick={onClickHere}>{clickHereText}</a>}
                        {toHandleItText}
                    </FormHelperText>
                </div>
            )
            break;
        }
        case HintType.ADD_DOUBLE_QUOTES: {
            component = (
                <div className={formClasses.suggestionsWrapper} >
                    <img className={formClasses.suggestionsIcon} src="../../../../../../images/console-error.svg" />
                    <FormHelperText className={formClasses.suggestionsText}>
                        {<a className={formClasses.suggestionsTextInfo} onClick={onClickHere}>{clickHereText}</a>}
                        {addDoubleQuotes}
                    </FormHelperText>
                </div>
            )
            break;
        }
        case HintType.ADD_DOUBLE_QUOTES_EMPTY: {
            component = (
                <div className={formClasses.suggestionsWrapper} >
                    <img className={formClasses.suggestionsIcon} src="../../../../../../images/console-error.svg" />
                    <FormHelperText className={formClasses.suggestionsText}>
                        {<a className={formClasses.suggestionsTextInfo} onClick={onClickHere}>{clickHereText}</a>}
                        {addDoubleQuotesToEmptyExpr}
                    </FormHelperText>
                </div>
            )
            break;
        }
        default: {
            component = null
            break;
        }
    }

    return (
        <>
            {component}
        </>
    )
}
