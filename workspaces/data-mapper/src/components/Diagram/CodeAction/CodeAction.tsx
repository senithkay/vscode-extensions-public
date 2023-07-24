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

import { CodeAction } from "vscode-languageserver-protocol";

import { IDataMapperContext } from "../../../utils/DataMapperContext/DataMapperContext";

import { CodeActionTooltip } from "./CodeActionTooltip/CodeActionTooltip";
import { LightBulbSVG } from "./LightBulb";
import { useStyles } from "./style";

export interface CodeActionWidgetProps {
    codeActions: CodeAction[];
    context: IDataMapperContext;
    additionalActions?: {
        title: string;
        onClick: () => void;
    }[];
}

export function CodeActionWidget(props: CodeActionWidgetProps) {
    const { codeActions, context, additionalActions } =
        props;
    const classes = useStyles();

    return (
        <CodeActionTooltip codeActions={codeActions} context={context} additionalActions={additionalActions}>
            <div className={classes.element}  data-testid={`expression-label-code-action`}>
                <span  className={classes.lightBulbWrapper}>
                    <LightBulbSVG />
                </span>
            </div>
        </CodeActionTooltip>
    );
}
