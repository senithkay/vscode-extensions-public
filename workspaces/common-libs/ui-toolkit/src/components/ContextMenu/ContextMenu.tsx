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
    VSCodeDataGrid,
    VSCodeDataGridCell,
    VSCodeDataGridRow,
    VSCodeProgressRing,
} from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import { Overlay } from "../Commons/Overlay";
import { Codicon } from "../Codicon/Codicon";

interface Item {
    id?: number | string;
    label?: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
}
export interface ContextMenuProps {
    id?: string;
    className?: string;
    menuItems?: Item[];
    isOpen?: boolean;
    isLoading?: boolean;
    menuId?: string;
    children?: React.ReactNode;
    icon?: ReactNode;
    sx?: any;
    iconSx?: any;
}

interface ContainerProps {
    sx?: any;
}

const VSCodeDataGridInlineCell = styled(VSCodeDataGridCell)`
    text-align: left;
    width: 220px;
    display: flex;
    align-items: center;
    padding: 6px 10px;
`;

const ExpandedMenu = styled.div<ContainerProps>`
    position: absolute;
    margin-top: 40px;
    z-index: 200;
    background: var(--vscode-editor-background);
    box-shadow: var(--vscode-widget-shadow) 0px 4px 10px;
    ${(props: ContextMenuProps) => props.sx};
`;

const IconWrapper = styled.div<ContainerProps>`
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
    const { id, className, isLoading, isOpen, menuId, sx, iconSx, menuItems, icon } = props;
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
        <Container id={id} className={className}>
            {isLoading ? (
                <SmallProgressRing />
            ) : (
                iconSx ? (
                    <IconWrapper onClick={handleClick} sx={iconSx} id={`component-list-menu-${menuId ? menuId : "btn"}`}>
                        {icon ? icon : <Codicon name="ellipsis"/>}
                    </IconWrapper>
                ) : (
                    <VSCodeButton appearance="icon" onClick={handleClick} title="More Actions" id={`component-list-menu-${menuId ? menuId : "btn"}`}>
                        {icon ? icon : <Codicon name="ellipsis"/>}
                    </VSCodeButton>
                )
            )}

            {isMenuOpen && (
                <ExpandedMenu sx={sx}>
                    <VSCodeDataGrid aria-label="Context Menu">
                        {menuItems?.map(item => (
                            <VSCodeDataGridRow
                                key={item.id}
                                onClick={(event: React.MouseEvent<HTMLElement, MouseEvent>) => {
                                    if (!item?.disabled) {
                                        event.stopPropagation();
                                        if (item?.onClick) {
                                            item.onClick();
                                        }
                                        setIsMenuOpen(false);
                                    }
                                }}
                                style={{
                                    cursor: item.disabled ? "not-allowed" : "pointer",
                                    opacity: item.disabled ? 0.5 : 1,
                                }}
                                id={`component-list-menu-${item.id}`}
                            >
                                <VSCodeDataGridInlineCell>{item.label}</VSCodeDataGridInlineCell>
                            </VSCodeDataGridRow>
                        ))}
                    </VSCodeDataGrid>
                </ExpandedMenu>
            )}
            {isMenuOpen && <Overlay onClose={handleMenuClose} />}
        </Container>
    );
};
