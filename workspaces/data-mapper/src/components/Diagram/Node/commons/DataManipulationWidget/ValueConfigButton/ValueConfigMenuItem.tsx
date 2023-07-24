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
import { createStyles, makeStyles, Theme, withStyles } from "@material-ui/core/styles";
import TooltipBase from "@material-ui/core/Tooltip";
import WarningIcon from "@material-ui/icons/Warning";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        itemContainer: {
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            alignItems: 'center'
        },
        symbol: {
            alignSelf: 'flex-end',
        },
        warning: {
            color: '#e85454',
            fontSize: '16px',
            marginLeft: '5px'
        }
    }),
);

export const tooltipStyles = {
    tooltip: {
        color: "#8d91a3",
        backgroundColor: "#fdfdfd",
        border: "1px solid #e6e7ec",
        borderRadius: 6,
        padding: "1rem"
    },
    arrow: {
        color: "#fdfdfd"
    }
};

export interface ValueConfigMenuItem {
    title: string;
    onClick: () => void;
    onClose?: () => void;
    warningMsg?: string;
    level?: number;
}

export function ValueConfigMenuItem(props: ValueConfigMenuItem) {
    const { title, onClick, onClose, warningMsg } = props;
    const TooltipComponent = withStyles(tooltipStyles)(TooltipBase);
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
                    <TooltipComponent
                        interactive={false}
                        arrow={true}
                        title={warningMsg}
                    >
                        <WarningIcon className={classes.warning}/>
                    </TooltipComponent>
                )}
            </div>
        </MenuItem>
    );
}
