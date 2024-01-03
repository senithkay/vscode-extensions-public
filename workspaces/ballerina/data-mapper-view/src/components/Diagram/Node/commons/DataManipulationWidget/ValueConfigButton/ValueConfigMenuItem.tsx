/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React from 'react';

import MenuItem from "@material-ui/core/MenuItem";
import WarningIcon from "@material-ui/icons/Warning";
import { Tooltip } from '@wso2-enterprise/ui-toolkit';
import { css } from '@emotion/css';

const useStyles = () => ({
    itemContainer: css({
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center'
    }),
    symbol: css({
        alignSelf: 'flex-end',
    }),
    warning: css({
        color: 'var(--vscode-editorError-foreground)',
        fontSize: '16px',
        marginLeft: '5px'
    })
});

export interface ValueConfigMenuItem {
    title: string;
    onClick: () => void;
    onClose?: () => void;
    warningMsg?: string;
    level?: number;
}

export function ValueConfigMenuItem(props: ValueConfigMenuItem) {
    const { title, onClick, onClose, warningMsg } = props;
    const classes = useStyles();

    const onClickMenuItem = () => {
        onClick();
        onClose();
    }

    return (
        <MenuItem
            key={title}
            onClick={onClickMenuItem}
            disabled={!onClick}
        >
            <div className={classes.itemContainer}>
                <div>{title}</div>
                {warningMsg && (
                    <Tooltip
                        content={warningMsg}
                    >
                        <WarningIcon className={classes.warning}/>
                    </Tooltip>
                )}
            </div>
        </MenuItem>
    );
}
