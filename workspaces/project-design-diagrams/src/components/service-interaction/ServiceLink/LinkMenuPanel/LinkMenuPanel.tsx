/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
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
