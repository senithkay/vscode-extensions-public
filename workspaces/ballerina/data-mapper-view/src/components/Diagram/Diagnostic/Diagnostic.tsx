/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js jsx-no-lambda
import React from "react";

import { Diagnostic } from "vscode-languageserver-types";

import ErrorIcon from "../../../assets/icons/Error";

import { DiagnosticTooltip } from "./DiagnosticTooltip/DiagnosticTooltip";
import { useStyles } from "./style";


export interface DiagnosticWidgetProps {
    diagnostic: Diagnostic,
    value?: string,
    onClick?: () => void,
    isLabelElement? : boolean
}


export function DiagnosticWidget(props: DiagnosticWidgetProps) {
    const {diagnostic, value, onClick, isLabelElement} =  props;
    const classes = useStyles();

    return (
        <DiagnosticTooltip diagnostic={diagnostic} value={value}  onClick={onClick}>
        <div className={isLabelElement && classes.element} data-testid={`expression-label-diagnostic`}>
            <div className={classes.iconWrapper}>
                <ErrorIcon  />
            </div>
        </div>
        </DiagnosticTooltip>
    )
}
