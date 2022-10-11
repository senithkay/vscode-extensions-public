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
import React from "react";

import { Divider, withStyles } from "@material-ui/core";
import TooltipBase, { TooltipProps } from '@material-ui/core/Tooltip';
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

    const TooltipComponent = withStyles(tooltipBaseStyles)(TooltipBase);

    const codeRef = (ref: HTMLPreElement) => {
        if (ref) {
            MonacoEditor.editor.colorizeElement(ref, { theme: 'choreoLightTheme' });
        }
    }

    const Code = () => (
        <React.Fragment>
            <Divider className={classes.divider} light={true} />
            <code
                ref={codeRef}
                data-lang="ballerina"
                className={classes.code}
            >
                {source.trim()}
            </code></React.Fragment>

    );
    const Diagnostic = () => (
        <div>
            <div className={classes.iconWrapper}>{iconComponent}</div>
            <div className={classes.diagnosticWrapper}>{diagnostic.message}</div>
        </div>

    );
    const OpenInCodeLink = () => (
        <></>
        //Enable once the onClick is fixed
        // <React.Fragment>
        //     <Divider className={classes.divider} light={true} />
        //     <div className={classes.editorLink} onClick={onClick}>View in Statement Editor</div>
        // </React.Fragment>
    )

    const tooltipTitleComponent = (
        <pre className={classes.pre}>
            {diagnostic.message && <Diagnostic />}
            {source && <Code />}
            {onClick && <OpenInCodeLink />}
        </pre>
    );

    return (
        <TooltipComponent interactive={false} arrow={true} title={tooltipTitleComponent} {...rest}>
            {children}
        </TooltipComponent>
    )

}
