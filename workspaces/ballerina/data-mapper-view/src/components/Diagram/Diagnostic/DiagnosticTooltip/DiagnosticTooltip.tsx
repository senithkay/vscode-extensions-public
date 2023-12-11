/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js jsx-no-lambda
import React, { useState } from "react";

import { Button, Divider, withStyles } from "@material-ui/core";
import TooltipBase, { TooltipProps } from '@material-ui/core/Tooltip';
import { Build } from "@material-ui/icons";
import * as MonacoEditor from 'monaco-editor';
import { Diagnostic } from "vscode-languageserver-types";

import ErrorIcon from "../../../../assets/icons/Error";
import { tooltipBaseStyles, useStyles } from "../style";

interface Props extends TooltipProps{
    diagnostic: Diagnostic
    value?: string
    onClick?: () => void;
}

export const DiagnosticTooltipID = "data-mapper-diagnostic-tooltip";

export function DiagnosticTooltip(props: Partial<Props>) {
    const { diagnostic, value, children, onClick, ...rest } = props;
    const classes = useStyles();
    const iconComponent =  <ErrorIcon /> ;
    const source = diagnostic.source || value

    const [isInteractive, setIsInteractive] = useState(true);

    const TooltipComponent = withStyles(tooltipBaseStyles)(TooltipBase);

    const codeRef = (ref: HTMLPreElement) => {
        if (ref) {
            void MonacoEditor.editor.colorizeElement(ref, { theme: 'choreoLightTheme' });
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
    const DiagnosticC = () => (
        <>
            <div className={classes.iconWrapper}>{iconComponent}</div>
            <div className={classes.diagnosticWrapper}>{diagnostic.message}</div>
        </>

    );

    const tooltipTitleComponent = (
        <pre className={classes.pre}>
            {diagnostic.message && <DiagnosticC />}
            {source && <Code />}
        </pre>
    );

    return (
        <TooltipComponent
            id={DiagnosticTooltipID}
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
