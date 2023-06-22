/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext } from "react";
import AddLinkIcon from "@mui/icons-material/AddLink";
import { CMEntryPoint as EntryPoint, CMService as Service } from '@wso2-enterprise/ballerina-languageclient';
import { DiagramContext } from "../../../DiagramContext/DiagramContext";
import { MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { useStyles } from "../styles/styles";

interface AddConnectorButtonProps {
    node: EntryPoint | Service;
}

export function AddConnectorButton(props: AddConnectorButtonProps) {
    const { node } = props;
    const classes = useStyles();

    const { setConnectorTarget } = useContext(DiagramContext);

    return (
        <MenuItem onClick={() => setConnectorTarget(node)}>
            <ListItemIcon>
                <AddLinkIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>Use External API</ListItemText>
        </MenuItem>
    );
}
