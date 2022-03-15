
/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import { Divider } from '@material-ui/core';
import { ErrorIcon, WarningIcon } from '@wso2-enterprise/ballerina-low-code-edtior-commons/lib/assets/icons';
import { STNode } from '@wso2-enterprise/syntax-tree';
import React from 'react';
import TooltipBase, { TooltipProps } from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles';
// import { getDiagnosticInfo } from './utils';
import * as MonacoEditor from 'monaco-editor';
import useStyles, { tooltipInvertedStyles, tooltipStyles } from "./style";

import { DiagnosticMsgSeverity, DiagramDiagnostic } from "@wso2-enterprise/ballerina-low-code-edtior-commons";


export interface TooltipPropsExtended extends TooltipProps {
    STNode: STNode;
    onClick: () => void;
    children: React.ReactElement<any, any>;
}

const toolTipComponent = withStyles(tooltipInvertedStyles)(TooltipBase);

export function DiagramTooltip(props: Partial<TooltipPropsExtended>) {
    const { STNode, onClick, children, ...restProps } = props;
    const classes = useStyles();
    const diagnosticsFromST = STNode?.typeData?.diagnostics;
    const diagnosticMsgs = getDiagnosticInfo(diagnosticsFromST);
    const iconComponent = diagnosticMsgs?.severity === "ERROR" ? <ErrorIcon /> : <WarningIcon />;
    let TooltipComponentRef = toolTipComponent;
    const codeSnippet = STNode?.source?.trim().split(')')[0];
    const errorSnippet = {
        diagnosticMsgs: diagnosticMsgs?.message,
        code: codeSnippet,
        severity: diagnosticMsgs?.severity
    }

    const Code = () => (
            <div>
            {codeSnippet?.trim()}
            </div>

    );

    const Diagnostic = () => (
        <div>
            <div className={classes.iconWrapper}>{iconComponent}</div>
            <div className={classes.diagnosticWrapper}>{diagnosticMsgs?.message}</div>
        </div>

    );

    const OpenInCodeLink = () => (
            <>
            <Divider className={classes.divider} light={true} />
            <div className={classes.editorLink} onClick={onClick}>View in Code Editor</div>
            </>
    )

    let text = diagnosticMsgs?.message+"\n"+codeSnippet;

    return (
        <g>
            {iconComponent}
            {diagnosticMsgs?.message && codeSnippet && <title>{text}</title>}
            {onClick && <OpenInCodeLink />}
            {children}
        </g>
    )
}

export function getDiagnosticInfo(diagnostics: DiagramDiagnostic[]): DiagnosticMsgSeverity {
    /* tslint:disable prefer-for-of */
    const diagnosticMsgsArray: string[] = [];
    if (diagnostics?.length === 0 || diagnostics === undefined) {
        return undefined;
    }
    else {
        if (diagnostics[0]?.diagnosticInfo?.severity === "WARNING") {
            for (let i = 0; i < diagnostics?.length; i++) {
                diagnosticMsgsArray.push(diagnostics[i]?.message)
            }
            return {
                message: diagnosticMsgsArray?.join(',\n'),
                severity: "WARNING"
            }
        }
        else {
            for (let i = 0; i < diagnostics?.length; i++) {
                diagnosticMsgsArray.push(diagnostics[i]?.message)
            }
            return {
                message: diagnosticMsgsArray?.join(',\n'),
                severity: "ERROR"
            }
        }
    }
}

