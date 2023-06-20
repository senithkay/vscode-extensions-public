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

import { MenuItem, withStyles } from "@material-ui/core";
import TooltipBase, { TooltipProps } from '@material-ui/core/Tooltip';
import { STModification } from "@wso2-enterprise/ballerina-languageclient";
import { CodeAction, TextDocumentEdit, TextEdit } from "vscode-languageserver-protocol";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { tooltipBaseStyles, useStyles } from "../style";

interface Props extends TooltipProps {
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
        modifications.sort((a, b) => a.startLine - b.startLine)
        void context.applyModifications(modifications);
    };

    if (additionalActions && additionalActions.length > 0) {
        additionalActions.forEach((item, index) => {
            menuItems.push(
                <MenuItem key={`${item.title}-${index}`} onClick={item.onClick} data-testid={`code-action-additional-${index}`}>
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
                    data-testid={`code-action-${index}`}
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
