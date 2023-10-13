/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from "react";
import styled from "@emotion/styled";
import { MoreVertIcon } from "../../resources/assets/icons";
import { Colors } from "../../resources";

export interface MenuItem {
    label: string;
    callback: (id: string) => void;
}

interface MoreVertMenuProps {
    menuItems: MenuItem[];
    id: string;
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
    border-radius: 4px;
    z-index: 1;
    box-shadow: 0 0 4px 0 ${Colors.NODE_BORDER};
    min-width: 120px;
`;

const MenuItem = styled.div`
    padding: 8px;
    cursor: pointer;
    &:hover {
        background-color: ${Colors.NODE_BACKGROUND_SECONDARY};
    }
`;

export function MoreVertMenu(props: MoreVertMenuProps) {
    const { menuItems, id } = props;
    const [showMenu, setShowMenu] = useState(false);

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
