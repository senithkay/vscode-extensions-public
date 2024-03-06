/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { DiagramContext } from "../../../DiagramContext/DiagramContext";
import { useStyles } from "../styles/styles";

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
            editLayerAPI.showErrorMessage({message: RESTRICTED_DELETE_MSG});
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
