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

import { Button, Divider, MenuItem, MenuList, withStyles } from "@material-ui/core";
import TooltipBase, { TooltipProps } from '@material-ui/core/Tooltip';
import { Build } from "@material-ui/icons";
import * as MonacoEditor from 'monaco-editor';
import { CodeAction, Diagnostic, TextDocumentEdit, TextEdit } from "vscode-languageserver-protocol";

import ErrorIcon from "../../../../assets/icons/Error";
import { tooltipBaseStyles, useStyles } from "../style";
import { STModification } from "@wso2-enterprise/ballerina-languageclient";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";

interface Props extends TooltipProps{
    codeActions: CodeAction[];
    context: IDataMapperContext;
    additionalActions?: {
        title: string;
        onClick: () => void;
    }[];
}

export const CodeActionTooltipID = "data-mapper-codeaction-tooltip";

export function CodeActionTooltip(props: Partial<Props>) {
    const { codeActions, context, children, additionalActions, ...rest } = props;
    const classes = useStyles();
    const menuItems: React.ReactNode[] = [];

    const [isInteractive, setIsInteractive] = useState(true);

    const TooltipComponent = withStyles(tooltipBaseStyles)(TooltipBase);

    const onOpen = () => {
        setIsInteractive(true);
    }

    const onCodeActionSelect = (action: CodeAction) => {
        const modifications: STModification[] = [];
        (action.edit?.documentChanges[0] as TextDocumentEdit).edits.forEach(
            (change: TextEdit) => {
                modifications.push({
                    type: "INSERT",
                    config: {
                        STATEMENT: change.newText,
                    },
                    endColumn: change.range.end.character,
                    endLine: change.range.end.line,
                    startColumn: change.range.start.character,
                    startLine: change.range.start.line,
                });
            }
        );
        context.applyModifications(modifications);
    };

    if (additionalActions && additionalActions.length > 0) {
        additionalActions.forEach((item, index) => {
            menuItems.push(
                <MenuItem key={`${item.title}-${index}`} onClick={item.onClick}>
                    {item.title}
                </MenuItem>
            );
        });
    }
    if (codeActions) {
        codeActions.forEach((action, index) => {
            menuItems.push(
                <MenuItem
                    key={index}
                    onClick={() => onCodeActionSelect(action)}
                >
                    {action.title}
                </MenuItem>
            );
        });
    }
    

    const tooltipTitleComponent = (
        <pre className={classes.pre}>
            {menuItems}
        </pre>
    );

    return (
        <TooltipComponent
            interactive={isInteractive}
            arrow={false}
            title={tooltipTitleComponent}
            onOpen={onOpen}
            {...rest}
        >
            {children}
        </TooltipComponent>
    )

}
