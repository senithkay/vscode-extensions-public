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
import AddLinkIcon from '@mui/icons-material/AddLink';
import { Service } from '../../../../resources';
import { useDiagramContext } from '../../DiagramContext/DiagramContext';
import { NodePosition } from '@wso2-enterprise/syntax-tree';

export function GoToDesign(props: { service: Service }) {
    const { service } = props;
    const { goToDesignDiagram } = useDiagramContext();
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const handleIconClick = () => {
        console.log('>>> service', service);
        // commands.executeCommand(PALETTE_COMMANDS.OPEN_IN_DIAGRAM);
        const position: NodePosition = {
            startLine: service.elementLocation.startPosition.line,
            startColumn: service.elementLocation.startPosition.offset,
            endLine: service.elementLocation.endPosition.line,
            endColumn: service.elementLocation.endPosition.offset,
        }
        goToDesignDiagram(position, service.elementLocation.filePath);
    }

    return (
        <Tooltip
            open={isHovered}
            title={'Go To Design'}
            arrow
            placement='right'
        >
            <AddLinkIcon
                onClick={handleIconClick}
                onMouseOver={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    backgroundColor: isHovered ? 'orange' : '',
                    borderRadius: '50%',
                    color: isHovered ? 'whitesmoke' : 'orange',
                    cursor: 'pointer',
                    fontSize: '22px',
                    padding: '2px'
                }}
            />
        </Tooltip>
    );
}

