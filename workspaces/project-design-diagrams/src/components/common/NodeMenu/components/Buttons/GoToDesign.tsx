/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from 'react';
import { CMRemoteFunction as RemoteFunction, CMResourceFunction as ResourceFunction, CMService as Service } from '@wso2-enterprise/ballerina-languageclient';
import { NodePosition } from '@wso2-enterprise/syntax-tree';
import EditIcon from '@mui/icons-material/Edit';
import { ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import { useStyles } from "../styles/styles";
import { useDiagramContext } from '../../../DiagramContext/DiagramContext';

export function GoToDesign(props: { element: Service | RemoteFunction | ResourceFunction }) {
    const classes = useStyles();
    const { element } = props;
    const { editLayerAPI } = useDiagramContext();

    const handleIconClick = () => {
        const position: NodePosition = {
            startLine: element.elementLocation.startPosition.line,
            startColumn: element.elementLocation.startPosition.offset,
            endLine: element.elementLocation.endPosition.line,
            endColumn: element.elementLocation.endPosition.offset,
        }
        editLayerAPI.goToDesign(element.elementLocation.filePath, position);
    }

    return (
        <MenuItem onClick={handleIconClick}>
            <ListItemIcon>
                <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>Go to Design</ListItemText>
        </MenuItem>
    );
}

