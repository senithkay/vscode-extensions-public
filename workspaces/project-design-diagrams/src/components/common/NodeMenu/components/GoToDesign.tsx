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

import React, { useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import { RemoteFunction, ResourceFunction, Service } from '../../../../resources';
import { NodePosition } from '@wso2-enterprise/syntax-tree';
import { ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import { useStyles } from "./styles";

export function GoToDesign(props: { element: Service | ResourceFunction | RemoteFunction }) {
    const classes = useStyles();
    const { element } = props;
    // const { goToDesignDiagram } = useDiagramContext();

    const handleIconClick = () => {
        // commands.executeCommand(PALETTE_COMMANDS.OPEN_IN_DIAGRAM);
        const position: NodePosition = {
            startLine: element.elementLocation.startPosition.line,
            startColumn: element.elementLocation.startPosition.offset,
            endLine: element.elementLocation.endPosition.line,
            endColumn: element.elementLocation.endPosition.offset,
        }
        // goToDesignDiagram(position, element.elementLocation.filePath);
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

