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
// tslint:disable: jsx-no-multiline-js
import * as React from "react";

import Button from '@material-ui/core/Button';
import { Theme, withStyles } from '@material-ui/core/styles';

export interface StatementEditorButtonProps {
    onClick?: () => void,
    disabled?: boolean;
}

export function StatementEditorButton(props: StatementEditorButtonProps) {
    const { onClick, disabled } = props;

    const EditorButton = withStyles((theme: Theme) => ({
        root: {
            textTransform: "capitalize",
            border: 0,
            background: "none",
            padding: 0,
            fontFamily: "arial, sans-seriff",
            color: theme.palette.primary.main,
            fontSize: 13,
            textDecoration: "underline",
            cursor: "pointer",
            "&:hover , &:focus, &:active": {
                backgroundColor: "#fff",
                color: theme.palette.primary.dark,
                boxShadow: "none",
                cursor: "pointer",
            },
            '&:disabled': {
                opacity: 0.5,
                background: '#fff',
                color: theme.palette.primary.light,
              },
        },
      }))(Button) as typeof Button;

    return (
            <EditorButton
                onClick={onClick}
                disabled={disabled}
            >
                Statement Editor
            </EditorButton>
    );
}

