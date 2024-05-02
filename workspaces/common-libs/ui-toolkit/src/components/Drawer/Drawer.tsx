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
    width?: number;
}

export interface DrawerItemProps {
    id?: string;
    isOpen: boolean;
    isSelected: boolean;
    width?: number;
    children?: React.ReactNode;
    sx?: any;
}

const DrawerContainer = styled.div<DrawerContainerProps>`
    position: absolute;
    width: 450px;
    height: 100vh;
    top: 0;
    right: 0;
    transform: translateX(${(props: DrawerContainerProps) => (props.isOpen ? '0' : '100%')});
    z-index: ${(props: DrawerContainerProps) => (props.isSelected ? 1 : 0)};
    background-color: var(--vscode-editor-background);
    color: var(--vscode-editor-foreground);
    box-shadow: 0 5px 10px 0 var(--vscode-badge-background);
    z-index: 2001;
    transition: transform 0.4s ease;
    width: ${(props: DrawerContainerProps) => `${props.width}px`};
    ${(props: DrawerContainerProps) => props.sx};
`;

export const Drawer: React.FC<DrawerItemProps> = (props: DrawerItemProps) => {
    const { isSelected, id, isOpen, sx, children } = props;
    const [open, setOpen] = useState(false);
    useEffect(() => {
        setOpen(isOpen);
    }, [isOpen]);
    return (
        <DrawerContainer id={id} isOpen={open} isSelected={isSelected} sx={sx}>
            {children}
        </DrawerContainer>
    );
};
