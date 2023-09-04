/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from 'react';
import LabelIcon from '@mui/icons-material/Label';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import { useStyles } from '../styles/styles';

interface EditLabelProps {
    handleDialogStatus: (status: boolean) => void;
}

export function EditLabelButton(props: EditLabelProps) {
    const { handleDialogStatus } = props;
    const classes = useStyles();

    return (
        <>
            <MenuItem onClick={() => handleDialogStatus(true)}>
                <ListItemIcon>
                    <LabelIcon fontSize='small' />
                </ListItemIcon>
                <ListItemText className={classes.listItemText}>Edit Label</ListItemText>
            </MenuItem>
        </>
    );
}
