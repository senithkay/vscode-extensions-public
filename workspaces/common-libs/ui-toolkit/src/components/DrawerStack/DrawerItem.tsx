/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';

interface DrawerContainerProps {
    isOpen: boolean;
    isSelected: boolean;
    sx?: any;
}

export interface DrawerItemProps {
    id?: string;
    isOpen: boolean;
    isSelected: boolean;
    children?: React.ReactNode;
    sx?: any;
}

const Drawer = styled.div<DrawerContainerProps>`
    position: absolute;
    width: 200px;
    height: 100%;
    background-color: #fff;
    border: 1px solid #ddd;
    right: 0;
    transform: translateX(${(props: DrawerContainerProps) => (props.isOpen ? '0' : '100%')});
    z-index: ${(props: DrawerContainerProps) => (props.isSelected ? 1 : 0)};
    transition: transform 0.4s ease;
    ${(props: DrawerContainerProps) => props.sx};
`;

export const DrawerItem: React.FC<DrawerItemProps> = (props: DrawerItemProps) => {
    const { isSelected, id, isOpen, sx, children } = props;
    const [open, setOpen] = useState(false);

    // useEffect(() => {
    //     // Trigger the transition after the component has mounted
    //     const timer = setTimeout(() => {
    //         setOpen(true);
    //     }, 400); // Delay can be adjusted

    //     return () => clearTimeout(timer); // Clean up the timer
    // }, []);
    useEffect(() => {
        setOpen(isOpen);
    }, [isOpen]);
    return (
        <Drawer id={id} isOpen={open} isSelected={isSelected} sx={sx}>
            {children}
        </Drawer>
    );
};
