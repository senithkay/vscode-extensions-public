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
import { Colors } from "../../resources";
import { Component } from "../../types";
import { Codicon, MenuItem, Item, Popover } from "@wso2-enterprise/ui-toolkit";

const ItemContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    line-height: 1.5;
    font-weight: 800;
    color: ${Colors.DEFAULT_TEXT};
    font-family: GilmerRegular;
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

export interface MenuItemDef {
    label: string;
    callback: (id: string, version?: string) => void;
}

interface MoreVertMenuProps {
    component: Component;
    menuItems: MenuItemDef[];
    hasComponentKind?: boolean;
}

const IconStyles = styled.div`
    position: absolute;
    background-color: ${Colors.NODE_BACKGROUND_PRIMARY};
    margin-left: 70px;
    margin-bottom: 80px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    transform: rotate(90deg);
    border: 1px solid var(--vscode-dropdown-border);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    line-height: 0;
    border: 3px solid ${Colors.LIGHT_GREY};
    transition: "transform 0.3s ease-in-out";
`;

export function MoreVertMenu(props: MoreVertMenuProps) {
    const { component, menuItems } = props;
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    
    const handleClick = (event?: React.MouseEvent<HTMLElement, MouseEvent>) => {
        event?.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const contextMenuItems: Item[] = menuItems.map((item) => {
        return {
            id: item.label,
            label: <ItemContainer>{item.label}</ItemContainer>,
            onClick: () => {
                item.callback(component.id, component.version);
                setAnchorEl(null);
            }
        };
    })

    return (
        <>
            <IconStyles>
                <Codicon sx={{display: "flex", justifyContent: "center", alignItems: "center"}} iconSx={{fontSize: 25, fontWeight: "bold"}} onClick={handleClick} name="ellipsis"/>
            </IconStyles>
            <Popover
                id={"contextMenu"}
                open
                anchorEl={anchorEl}
                sx={{padding: "5px 0", cursor: "pointer"}}
            >
                {contextMenuItems.map((item) =>
                    (<MenuItem key={`item ${item.id}`} item={item} onClick={item?.onClick} />)
                )}
            </Popover>
        </>
    );
}
