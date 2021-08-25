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
import * as MonacoEditor from 'monaco-editor';

import { useStyles as useFormStyles } from "../../forms/style";

import { truncateText } from "./utils";

export enum HintType {
    ADD_CHECK,
    ADD_DOUBLE_QUOTES,
    ADD_DOUBLE_QUOTES_EMPTY,
    ADD_TO_STRING,
    ADD_ELVIS_OPERATOR
}

interface ExpressionEditorHintProps {
    onClickHere: () => void;
    type: HintType;
    editorContent?: string;
}

export function ExpressionEditorHint(props: ExpressionEditorHintProps) {
    const { type, onClickHere, editorContent } = props;

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
        defaultMessage: " to change to "
    })

    const addDoubleQuotesToEmptyExpr = intl.formatMessage({
        id: "lowcode.develop.elements.expressionEditor.invalidSourceCode.errorMessage.addDoubleQuotesToEmptyExpr.text",
        defaultMessage: " to make an empty string"
    })

    const addToString = intl.formatMessage({
        id: "lowcode.develop.elements.expressionEditor.invalidSourceCode.errorMessage.addToString.text",
        defaultMessage: " to make a string using "
    })

    const codeSnippetToString = intl.formatMessage({
        id: "lowcode.develop.elements.expressionEditor.invalidSourceCode.errorMessage.codeSnippetToString.text",
        defaultMessage: "toString()"
    })

    const addElvisOperator = intl.formatMessage({
        id: "lowcode.develop.elements.expressionEditor.invalidSourceCode.errorMessage.addElvisOperator.text",
        defaultMessage: " to handle optional value"
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
                        <CodeSnippet content={`"${truncateText(editorContent)}"`} />
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
        case HintType.ADD_TO_STRING: {
            component = (
                <div className={formClasses.suggestionsWrapper} >
                    <img className={formClasses.suggestionsIcon} src="../../../../../../images/console-error.svg" />
                    <FormHelperText className={formClasses.suggestionsText}>
                        {<a className={formClasses.suggestionsTextInfo} onClick={onClickHere}>{clickHereText}</a>}
                        {addToString}
                        <CodeSnippet content={codeSnippetToString} />
                    </FormHelperText>
                </div>
            )
            break;
        }
        case HintType.ADD_ELVIS_OPERATOR: {
            component = (
                <div className={formClasses.suggestionsWrapper} >
                    <img className={formClasses.suggestionsIcon} src="../../../../../../images/console-error.svg" />
                    <FormHelperText className={formClasses.suggestionsText}>
                        {<a className={formClasses.suggestionsTextInfo} onClick={onClickHere}>{clickHereText}</a>}
                        {addElvisOperator}
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

function CodeSnippet(props: { content: string }) {
    const { content } = props;
    const formClasses = useFormStyles();

    const codeRef = (ref: HTMLPreElement) => {
        if (ref) {
            MonacoEditor.editor.colorizeElement(ref, { theme: 'exp-theme' });
        }
    };

    const Code = () => (
        <code ref={codeRef} data-lang="ballerina" className={formClasses.suggestionsTextCodeSnippet} >
            {content}
        </code>
    )
    return (
        <pre className={formClasses.pre}>
            {content && <Code/>}
        </pre>
    )
}
