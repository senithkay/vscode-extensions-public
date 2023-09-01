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
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { DiagramContext } from "../../../common";
import { ServiceLinkModel } from "../ServiceLinkModel";
import { ServiceNodeModel } from "../../ServiceNode/ServiceNodeModel";

export const useStyles = makeStyles(() =>
    createStyles({
        listItemText: {
            color: "#595959",
            "& .MuiListItemText-primary": {
                fontSize: 14,
                fontFamily: "GilmerRegular",
            },
        }
    })
);

interface DeleteLinkProps {
    handleClose: () => void;
    link: ServiceLinkModel;
}

export function DeleteLinkButton(props: DeleteLinkProps) {
    const classes = useStyles();
    const { link, handleClose } = props;
    const { editLayerAPI, refreshDiagram } = useContext(DiagramContext);

    const handleOnClick = () => {
        editLayerAPI.deleteLink(link.location, (link.getSourcePort().getNode() as ServiceNodeModel).nodeObject.elementLocation)
            .then(() => {
                handleClose();
                refreshDiagram();
            });
    }

    return (
        <MenuItem onClick={handleOnClick}>
            <ListItemIcon>
                <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>Delete Link</ListItemText>
        </MenuItem>
    );
}
