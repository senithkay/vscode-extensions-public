/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext } from "react";
import TurnRightIcon from "@mui/icons-material/TurnRight";
import { MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { DiagramContext } from "../../../DiagramContext/DiagramContext";
import { useStyles } from "../styles/styles";
import { EntryNodeModel, ServiceNodeModel } from "../../../../service-interaction";

interface LinkingButtonProps {
    node: ServiceNodeModel | EntryNodeModel;
}

export function LinkingButton(props: LinkingButtonProps) {
    const { node } = props;
    const classes = useStyles();
    const { setNewLinkNodes } = useContext(DiagramContext);

    return (
        <MenuItem
            onClick={() => {
                setNewLinkNodes({ source: node, target: undefined });
            }}
        >
            <ListItemIcon>
                <TurnRightIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>Use Internal API</ListItemText>
        </MenuItem>
    );
}
