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
    right: -12px;
    cursor: pointer;
    z-index: 1;
    svg {
        fill: ${Colors.NODE_BORDER};
        width: 24px;
        transition: transform 0.3s ease-in-out;
        transform: ${(props) => (props.rotate ? "rotate(180deg)" : "rotate(0)")};
    }
`;

const BubbleAnimation = styled.div`
    position: absolute;
    top: 40%;
    right: 50%;
    transform: translate(50%, -50%);
    background-color: ${Colors.NODE_BACKGROUND_PRIMARY};
    border: 3px solid ${Colors.LIGHT_GREY};
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: fade-in-out 0.2s ease-out forwards;

    @keyframes fade-in-out {
        0% {
            opacity: 0;
            transform: translate(50%, -50%) scale(0.5);
        }
        100% {
            opacity: 1;
            transform: translate(50%, -50%) scale(1);
        }
    }
`;

export interface MenuItem {
    label: string;
    callback: (id: string, version?: string) => void;
}

interface MoreVertMenuProps {
    component: Component;
    menuItems: MenuItem[];
}

export function MoreVertMenu(props: MoreVertMenuProps) {
    const { component, menuItems } = props;

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const open = Boolean(anchorEl);

    const handleMenuButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <MenuButton onClick={handleMenuButtonClick}>
                <BubbleAnimation />
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
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "left",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                }}
            >
                {menuItems.map((item, index) => (
                    <MenuItem
                        key={index}
                        onClick={() => {
                            item.callback(component.id, component.version);
                        }}
                    >
                        {item.label}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}
