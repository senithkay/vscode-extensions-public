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
import React from 'react';

import { IconButton } from "@material-ui/core";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import TripleDotsIcon from "../../../../../../assets/icons/TripleDotsIcon";

const useStyles = makeStyles((theme: Theme) =>
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


export interface ValueConfigButtonProps {
    onClick: () => void;
}

export function ValueConfigButton(props: ValueConfigButtonProps) {
    const { onClick } = props;
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLButtonElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const onClickAddOrEditValue = () => {
        handleClose();
        onClick();
    }

    const onClickDeleteValue = () => {
        handleClose();
        // TODO
    }

    return (
        <>
            <IconButton
                aria-label="addOrEdit"
                className={classes.tripleDotsIcon}
                onClick={(e) => handleClick(e)}
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
                <MenuItem
                    onClick={onClickAddOrEditValue}
                >
                    Add/Edit Value
                </MenuItem>
                <MenuItem
                    disabled={true}
                    onClick={onClickDeleteValue}
                >
                    Delete Value
                </MenuItem>
            </Menu>
        </>
    );
}
