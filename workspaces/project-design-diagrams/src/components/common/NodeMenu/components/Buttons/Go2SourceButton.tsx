/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext } from "react";
import { CMLocation as Location } from "@wso2-enterprise/ballerina-languageclient";
import { MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";
import { DiagramContext } from "../../../DiagramContext/DiagramContext";
import { useStyles } from "../styles/styles";

export function Go2SourceButton(props: { location: Location }) {
    const { location } = props;
    const classes = useStyles();
    const { editLayerAPI } = useContext(DiagramContext);

    return (
        <MenuItem onClick={() => editLayerAPI?.go2source(location)}>
            <ListItemIcon>
                <CodeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>Go to source</ListItemText>
        </MenuItem>
    );
}
