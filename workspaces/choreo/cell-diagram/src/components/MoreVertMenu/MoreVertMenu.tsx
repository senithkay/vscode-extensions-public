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

export interface MenuItem {
    label: string;
    callback: (id: string) => void;
}

interface MoreVertMenuProps {
    id: string;
    menuItems: MenuItem[];
    showMenu: boolean;
    setShowMenu: (showMenu: boolean) => void;
}

const MenuButton: React.FC<any> = styled.div`
    position: absolute;
    top: -4px;
    right: -4px;
    cursor: pointer;
    z-index: 1;
    svg {
        fill: ${Colors.NODE_BORDER};
        width: 24px;
        transition: transform 0.3s ease-in-out;
        transform: ${(props) => (props.rotate ? "rotate(180deg)" : "rotate(0)")};
    }
`;

const Menu = styled.div`
    position: absolute;
    top: 4px;
    right: 0;
    background-color: ${Colors.NODE_BACKGROUND_PRIMARY};
    padding: 8px 0;

    color: rgba(0, 0, 0, 0.87);
    -webkit-transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    border-radius: 4px;
    box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12);
    z-index: 1;
    min-width: 120px;
    max-width: 100%;
`;

const MenuItem = styled.div`
    padding: 8px;
    cursor: pointer;
    &:hover {
        background-color: ${Colors.NODE_BACKGROUND_SECONDARY};
    }
`;

export function MoreVertMenu(props: MoreVertMenuProps) {
    const { id, menuItems, showMenu, setShowMenu } = props;

    const handleMenuButtonClick = () => {
        setShowMenu(!showMenu);
    };

    return (
        <>
            <MenuButton onClick={handleMenuButtonClick} rotate={showMenu}>
                <MoreVertIcon />
            </MenuButton>
            {showMenu && (
                <Menu>
                    {menuItems.map((item, index) => (
                        <MenuItem
                            key={index}
                            onClick={() => {
                                item.callback(id);
                                setShowMenu(false);
                            }}
                        >
                            {item.label}
                        </MenuItem>
                    ))}
                </Menu>
            )}
        </>
    );
}
