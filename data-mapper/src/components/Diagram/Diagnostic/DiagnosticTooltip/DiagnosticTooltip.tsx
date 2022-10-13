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
// tslint:disable: jsx-no-multiline-js jsx-no-lambda
import React, { useState } from "react";

import { Button, Divider, withStyles } from "@material-ui/core";
import TooltipBase, { TooltipProps } from '@material-ui/core/Tooltip';
import { Build } from "@material-ui/icons";
import * as MonacoEditor from 'monaco-editor';
import { Diagnostic } from "vscode-languageserver-protocol";

import ErrorIcon from "../../../../assets/icons/Error";
import { tooltipBaseStyles, useStyles } from "../style";

interface Props extends TooltipProps{
    diagnostic: Diagnostic
    value?: string
    onClick?: () => void;
}

export function DiagnosticTooltip(props: Partial<Props>) {
    const { diagnostic, value, children, onClick, ...rest } = props;
    const classes = useStyles();
    const iconComponent =  <ErrorIcon /> ;
    const source = diagnostic.source || value

    const [isInteractive, setIsInteractive] = useState(true);

    const TooltipComponent = withStyles(tooltipBaseStyles)(TooltipBase);

    const codeRef = (ref: HTMLPreElement) => {
        if (ref) {
            MonacoEditor.editor.colorizeElement(ref, { theme: 'choreoLightTheme' });
        }
    }

    const onCLickOnEdit = () => {
        setIsInteractive(false);
        onClick();
    }

    const onOpen = () => {
        setIsInteractive(true);
    }

    const Code = () => (
        <>
            <Divider className={classes.divider} light={true} />
            <div className={classes.source}>
                <code
                    ref={codeRef}
                    data-lang="ballerina"
                    className={classes.code}
                >
                    {source.trim()}
                </code>
                <Button
                    aria-label="edit"
                    className={classes.editText}
                    onClick={onCLickOnEdit}
                    startIcon={(
                        <Build
                            className={classes.editButton}
                        />
                    )}
                >
                    Fix by editing expression
                </Button>
            </div>
        </>

    );
    const Diagnostic = () => (
        <>
            <div className={classes.iconWrapper}>{iconComponent}</div>
            <div className={classes.diagnosticWrapper}>{diagnostic.message}</div>
        </>

    );

    const tooltipTitleComponent = (
        <pre className={classes.pre}>
            {diagnostic.message && <Diagnostic />}
            {source && <Code />}
        </pre>
    );

    return (
        <TooltipComponent
            interactive={isInteractive}
            arrow={true}
            title={tooltipTitleComponent}
            onOpen={onOpen}
            {...rest}
        >
            {children}
        </TooltipComponent>
    )

}
