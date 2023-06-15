/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */
// tslint:disable: jsx-no-lambda  jsx-no-multiline-js
import React from 'react';

import { IconButton } from "@material-ui/core";
import Menu from "@material-ui/core/Menu";
import { createStyles, makeStyles } from "@material-ui/core/styles";

import TripleDotsIcon from "../../../../../../assets/icons/TripleDotsIcon";

import { ValueConfigMenuItem } from "./ValueConfigMenuItem";

const useStyles = makeStyles(() =>
    createStyles({
        tripleDotsIcon: {
            color: "#5567D5",
            padding: "5px",
            width: 'fit-content',
            height: "25px",
            float: "right",
            marginLeft: "auto"
        },
        valueConfigMenu: {
            '& .MuiMenuItem-root': {
                fontSize: '11px',
                paddingBottom: "1px",
                paddingTop: "1px"
            }
        }
    }),
);

export enum ValueConfigOption {
    InitializeWithValue = "Initialize With Default Value",
    EditValue = "Edit Value",
    InitializeArray = "Initialize Array",
    DeleteValue = "Delete Value",
    DeleteElement = "Delete Element",
    DeleteArray = "Delete Array"
}

export interface ValueConfigMenuProps {
    menuItems: ValueConfigMenuItem[]
    isDisabled?: boolean;
    portName?: string
}

export function ValueConfigMenu(props: ValueConfigMenuProps) {
    const { menuItems, isDisabled, portName } = props;
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLButtonElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton
                id="button-wrapper"
                aria-label="valueConfig"
                className={classes.tripleDotsIcon}
                onClick={(e) => handleClick(e)}
                disabled={isDisabled}
                data-testid={`value-config-${portName}`}
            >
                <TripleDotsIcon />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                className={classes.valueConfigMenu}
            >
                {
                    menuItems.map((menuItem: ValueConfigMenuItem) => {
                        return (
                            <ValueConfigMenuItem
                                key={menuItem.title}
                                title={menuItem.title}
                                onClick={menuItem.onClick}
                                onClose={handleClose}
                                data-testid={`value-config-${portName}-item-${menuItem.title}`}
                            />
                        )
                    })
                }
            </Menu>
        </>
    );
}
