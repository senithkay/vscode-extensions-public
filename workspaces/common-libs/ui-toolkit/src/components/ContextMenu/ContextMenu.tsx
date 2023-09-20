/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { ReactNode, useState } from "react";
import {
    VSCodeButton,
    VSCodeProgressRing,
} from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import { Overlay } from "../Commons/Overlay";
import { Codicon } from "../Codicon/Codicon";

export interface ContextMenuProps {
    isOpen?: boolean;
    // onClick: (event?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
    // onClose: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
    isLoading?: boolean;
    menuId?: string;
    children?: React.ReactNode;
    icon?: ReactNode;
    sx?: any;
}

export interface ContainerProps {
    sx?: any;
}

const ExpandedMenu = styled.div<ContainerProps>`
    position: absolute;
    margin-top: 30px;
    z-index: 15;
    background: var(--vscode-editor-background);
    box-shadow: var(--vscode-widget-shadow) 0px 4px 10px;
    ${(props: ContextMenuProps) => props.sx};
`;

const SmallProgressRing = styled(VSCodeProgressRing)`
    height: calc(var(--design-unit) * 3px);
    width: calc(var(--design-unit) * 3px);
    margin-top: auto;
    padding: 4px;
`;

const Container = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const ContextMenu: React.FC<ContextMenuProps> = (props: ContextMenuProps) => {
    const { isLoading, isOpen, menuId, sx, children, icon } = props;
    const [isMenuOpen, setIsMenuOpen] = useState(isOpen);

    const handleClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        event.stopPropagation();
        setIsMenuOpen(true);
    };

    const handleMenuClose = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        event.stopPropagation();
        setIsMenuOpen(false);
    };

    return (
        <Container>
            {isLoading ? (
                <SmallProgressRing />
            ) : (
                <VSCodeButton appearance="icon" onClick={handleClick} title="More Actions" id={`component-list-menu-${menuId ? menuId : "btn"}`}>
                    {icon ? icon : <Codicon name="ellipsis" />}
                </VSCodeButton>
            )}

            {isMenuOpen && (
                <ExpandedMenu sx={sx}>
                    {children}
                </ExpandedMenu>
            )}
            {isMenuOpen && <Overlay onClose={handleMenuClose} />}
        </Container>
    );
};
