/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { ReactNode, useEffect, useState } from "react";
import {
    VSCodeButton,
    VSCodeDataGrid,
    VSCodeDataGridCell,
    VSCodeDataGridRow,
    VSCodeProgressRing,
} from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import { Codicon } from "../Codicon/Codicon";
import { ClickAwayListener } from "../ClickAwayListener/ClickAwayListener";
import { createPortal } from "react-dom";

interface Item {
    id: number | string;
    label: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
}

type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top" | "bottom" | "left" | "right";

export interface ContextMenuProps {
    id?: string;
    className?: string;
    menuItems?: Item[];
    isOpen?: boolean;
    isLoading?: boolean;
    menuId?: string;
    children?: React.ReactNode;
    icon?: ReactNode;
    sx?: React.CSSProperties;
    iconSx?: React.CSSProperties;
    menuSx?: React.CSSProperties;
    position?: Position;
}

interface ContainerProps {
    sx?: any;
    top?: number;
    left?: number;
}

const VSCodeDataGridInlineCell = styled(VSCodeDataGridCell)`
    color: var(--vscode-inputOption-activeForeground);
    text-align: left;
    display: flex;
    align-items: center;
    padding: 6px 10px;
    &:hover {
        color: var(--button-primary-foreground);
        background-color: var(--vscode-button-hoverBackground);
    };
`;

const ExpandedMenu = styled.div<ContainerProps>`
    position: absolute;
    z-index: 200;
    background: var(--vscode-editor-background);
    box-shadow: var(--vscode-widget-shadow) 0px 4px 10px;
    top: ${(props: ContainerProps) => `${props.top}px`};
    left: ${(props: ContainerProps) => `${props.left}px`};
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
    const { id, className, isLoading, isOpen, menuId, sx, iconSx, menuSx, menuItems, icon, position = "bottom" } = props;
    const [isMenuOpen, setIsMenuOpen] = useState(isOpen);
    const [expandMenuWidth, setExpandMenuWidth] = useState(0);
    const [expandMenuHeight, setExpandMenuHeight] = useState(0);

    const iconRef = React.useRef<HTMLDivElement>(null);
    // X and Y coordinates of the icon middle point
    const iconMiddlePointX = iconRef.current?.getBoundingClientRect().left + iconRef.current?.getBoundingClientRect().width / 2;
    const iconMiddlePointY = iconRef.current?.getBoundingClientRect().top + iconRef.current?.getBoundingClientRect().height / 2;

    const expandMenuRef = React.useRef<HTMLDivElement>(null);
    // Top and Left coordinates of the expanded menu
    let top = 0;
    let left = 0;
    switch (position) {
        case "top-left":
            top = iconMiddlePointY - expandMenuHeight;
            left = iconMiddlePointX - expandMenuWidth;
            break;
        case "top-right":
            top = iconMiddlePointY - expandMenuHeight;
            left = iconMiddlePointX;
            break;
        case "bottom-left":
            top = iconMiddlePointY;
            left = iconMiddlePointX - expandMenuWidth;
            break;
        case "bottom-right":
            top = iconMiddlePointY;
            left = iconMiddlePointX;
            break;
        case "top":
            top = iconMiddlePointY - expandMenuHeight;
            left = iconMiddlePointX - expandMenuWidth / 2;
            break;
        case "bottom":
            top = iconMiddlePointY;
            left = iconMiddlePointX - expandMenuWidth / 2;
            break;
        case "left":
            top = iconMiddlePointY - expandMenuHeight / 2;
            left = iconMiddlePointX - expandMenuWidth;
            break;
        case "right":
            top = iconMiddlePointY - expandMenuHeight / 2;
            left = iconMiddlePointX;
            break;
    }

    const handleClick = () => {
        setIsMenuOpen(true);
    };

    useEffect(() => {
        if (isMenuOpen) {
            setExpandMenuWidth(expandMenuRef.current?.clientWidth || 0);
            setExpandMenuHeight(expandMenuRef.current?.clientHeight || 0);
        }
    }, [isMenuOpen]);

    return (
        <ClickAwayListener onClickAway={() => setIsMenuOpen(false)}>
            <Container id={id} className={className}>
                {isLoading ? (
                    <SmallProgressRing />
                ) : (
                    iconSx ? (
                        <IconWrapper ref={iconRef} onClick={handleClick} id={`component-list-menu-${menuId ? menuId : "btn"}`}>
                            {icon ? icon : <Codicon name="ellipsis" iconSx={iconSx} sx={sx}/>}
                        </IconWrapper>
                    ) : (
                        <VSCodeButton ref={iconRef} appearance="icon" onClick={handleClick} title="More Actions" id={`component-list-menu-${menuId ? menuId : "btn"}`}>
                            {icon ? icon : <Codicon name="ellipsis"/>}
                        </VSCodeButton>
                    )
                )}
                {isMenuOpen &&
                createPortal(
                    <ExpandedMenu ref={expandMenuRef} sx={menuSx} top={top} left={left}>
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
                    </ExpandedMenu>,
                    document.body
                )}
            </Container>
        </ClickAwayListener>
    );
};
