/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";

import { ListItemIcon, ListItemText, MenuItem } from "@material-ui/core";
import CenterFocusWeakIcon from '@material-ui/icons/CenterFocusWeak';

import { useGraphQlContext } from "../DiagramContext/GraphqlDiagramContext";
import { NodeType } from "../NodeFilter";

import { useStyles } from "./styles";

interface FocusToNodeMenuProps {
    nodeType: NodeType;
}

export function FilterNodeMenuItem(props: FocusToNodeMenuProps) {
    const { nodeType } = props;
    const { setFilteredNode } = useGraphQlContext();
    const menuStyles = useStyles();

    const handleOnClick = () => {
        setFilteredNode(nodeType);
    };

    return (
        <MenuItem onClick={handleOnClick} className={menuStyles.menuItem} data-testid="show-subgraph-menu">
            <ListItemIcon className={menuStyles.menuIcon}>
                <CenterFocusWeakIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText className={menuStyles.listItemText}>Show Subgraph</ListItemText>
        </MenuItem>
    )
}
