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
            <div className={classes.element} >
                <span  className={classes.lightBulbWrapper}>
                    <LightBulbSVG />
                </span>
            </div>
        </CodeActionTooltip>
    );
}
