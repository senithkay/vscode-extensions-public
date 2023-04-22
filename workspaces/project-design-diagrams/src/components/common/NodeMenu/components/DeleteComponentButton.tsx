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

import React, { useContext } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { DiagramContext } from "../../DiagramContext/DiagramContext";
import { useStyles } from "./styles/styles";

interface DeleteComponentProps {
    handleDialogStatus: (status: boolean) => void;
    canDelete: boolean;
}

const RESTRICTED_DELETE_MSG = "Cannot delete components with incoming links. Please remove the links first.";

export function DeleteComponentButton(props: DeleteComponentProps) {
    const { canDelete, handleDialogStatus } = props;
    const { editLayerAPI } = useContext(DiagramContext);
    const classes = useStyles();

    const handleOnClick = () => {
        if (canDelete) {
            handleDialogStatus(true);
        } else {
            editLayerAPI.showErrorMessage(RESTRICTED_DELETE_MSG);
        }
    }

    return (
        <MenuItem onClick={handleOnClick}>
            <ListItemIcon>
                <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>Delete Component</ListItemText>
        </MenuItem>
    );
}
