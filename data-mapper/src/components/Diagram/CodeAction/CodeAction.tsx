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
import React, { useEffect } from "react";

import { STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    CodeAction,
    TextDocumentEdit,
    TextEdit,
} from "vscode-languageserver-protocol";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { IDataMapperContext } from "../../../utils/DataMapperContext/DataMapperContext";
import { LightBulbSVG } from "./LightBulb";
import { useStyles } from "./style";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles, Theme, createStyles } from "@material-ui/core";

export interface CodeActionWidgetProps {
    codeActions: CodeAction[];
    context: IDataMapperContext;
    labelWidgetVisible?: boolean;
    additionalActions?: {
        title: string;
        onClick: () => void;
    }[];
}

export function CodeActionWidget(props: CodeActionWidgetProps) {
    const { codeActions, context, labelWidgetVisible, additionalActions } =
        props;
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLButtonElement>(null);
    const open = Boolean(anchorEl);
    const menuItems: React.ReactNode[] = [];

    if (additionalActions && additionalActions.length > 0) {
        additionalActions.forEach((item, index) => {
            menuItems.push(
                <MenuItem key={`${item.title}-${index}`} onClick={item.onClick}>
                    {item.title}
                </MenuItem>
            );
        });
    }

    useEffect(() => {
        if (!labelWidgetVisible) {
            setAnchorEl(null);
        }
    }, [labelWidgetVisible]);

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

    const onClickCodeAction = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    return (
        <div className={classes.element} >
            <span  className={classes.lightBulbWrapper} onClick={onClickCodeAction}>
                <LightBulbSVG />
            </span>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                className={classes.menu}
            >
                {menuItems}
            </Menu>
        </div>
    );
}
