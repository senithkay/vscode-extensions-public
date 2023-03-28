/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import React from 'react';
import LabelIcon from '@mui/icons-material/Label';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import { useStyles } from './styles';

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
