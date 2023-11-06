/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import styled from "@emotion/styled";
import { MoreVertIcon } from "../../resources/assets/icons";
import { Colors } from "../../resources";
import { Component } from "../../types";
import { Menu, MenuItem } from "@mui/material";

const MenuButton: React.FC<any> = styled.div`
    position: absolute;
    top: -4px;
    right: -16px;
    cursor: pointer;
    cursor: context-menu;
    z-index: 1;
    svg {
        fill: ${Colors.NODE_BORDER};
        width: 24px;
        transition: transform 0.3s ease-in-out;
        transform: ${(props) => (props.rotate ? "rotate(180deg)" : "rotate(0)")};
    }
`;

export interface MenuItem {
    label: string;
    callback: (id: string, version?: string) => void;
}

interface MoreVertMenuProps {
    component: Component;
    menuItems: MenuItem[];
    showMenu: boolean;
    setShowMenu: (showMenu: boolean) => void;
}

export function MoreVertMenu(props: MoreVertMenuProps) {
    const { component, menuItems, showMenu, setShowMenu } = props;

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = showMenu && Boolean(anchorEl);

    const handleMenuButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        setShowMenu(true);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setShowMenu(false);
    };

    return (
        <>
            <MenuButton onClick={handleMenuButtonClick} rotate={showMenu}>
                <MoreVertIcon />
            </MenuButton>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    "aria-labelledby": "basic-button",
                }}
            >
                {menuItems.map((item, index) => (
                    <MenuItem
                        key={index}
                        onClick={() => {
                            item.callback(component.id, component.version);
                            setShowMenu(false);
                        }}
                    >
                        {item.label}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}
