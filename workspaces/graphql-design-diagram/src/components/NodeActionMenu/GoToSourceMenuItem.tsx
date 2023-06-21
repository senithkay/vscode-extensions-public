/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

// tslint:disable: jsx-no-multiline-js jsx-no-lambda jsx-wrap-multiline no-submodule-imports
import React from "react";

import { ListItemIcon, ListItemText, MenuItem } from "@material-ui/core";
import CodeIcon from "@mui/icons-material/Code";

import { useGraphQlContext } from "../DiagramContext/GraphqlDiagramContext";
import { Position } from "../resources/model";
import { getFormattedPosition } from "../utils/common-util";

import { useStyles } from "./styles";

interface GoToSourceMenuProps {
    location: Position;
}

export function GoToSourceMenuItem(props: GoToSourceMenuProps) {
    const { location } = props;
    const menuStyles = useStyles();

    const filePath = location?.filePath;
    const position = getFormattedPosition(location);

    const { goToSource } = useGraphQlContext();
    const handleOnClick = () => {
        goToSource(filePath, position);
    };

    return (
        <>
            {filePath && position &&
            <MenuItem onClick={handleOnClick} className={menuStyles.shortcutMenuItem}>
                <ListItemIcon className={menuStyles.menuIcon}>
                    <CodeIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText className={menuStyles.listItemText}>Go to Source</ListItemText>
                <ListItemText className={menuStyles.shortcutItem}>Ctrl + left click</ListItemText>
            </MenuItem>
            }
        </>
    );
}
