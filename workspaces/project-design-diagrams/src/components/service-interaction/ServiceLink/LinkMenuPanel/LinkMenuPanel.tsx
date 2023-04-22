/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import React from 'react';
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import Popover from '@mui/material/Popover';
import { Go2SourceButton } from '../../../common/NodeMenu/components';
import { DeleteLinkButton } from './DeleteLinkButton';
import { ServiceLinkModel } from '../ServiceLinkModel';

interface ServiceLinkMenuProps {
    link: ServiceLinkModel;
    anchorElement: SVGPathElement | HTMLDivElement;
    position: { x: any, y: any };
    onMouseOver: (event: React.MouseEvent<SVGPathElement | HTMLDivElement>) => void;
    onMouseLeave: () => void;
    isL2?: boolean;
}

export function ServiceLinkMenu(props: ServiceLinkMenuProps) {
    const { anchorElement, isL2 = false, link, position, onMouseLeave, onMouseOver } = props;

    return (
        <Popover
            id='mouse-over-popover'
            open={Boolean(anchorElement)}
            disableRestoreFocus
            onClose={onMouseLeave}
            PaperProps={{ onMouseLeave: onMouseLeave, onMouseOver: onMouseOver }}
            anchorPosition={{
                top: position.y,
                left: position.x
            }}
            anchorOrigin={{
                vertical: position.y,
                horizontal: position.x
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: isL2 ? 'left' : 'center'
            }}
        >
            <Paper sx={{ maxWidth: "100%" }}>
                <MenuList>
                    <Go2SourceButton location={link.location} />
                    <DeleteLinkButton handleClose={onMouseLeave} link={link} />
                </MenuList>
            </Paper>
        </Popover>
    );
}
