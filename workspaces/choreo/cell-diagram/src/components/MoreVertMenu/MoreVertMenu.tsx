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
import { ContextMenu } from "@wso2-enterprise/ui-toolkit";

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

const ItemContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    /* gap: 5px; */
    justify-content: flex-start;
    line-height: 1.5;
    font-size: 16px;
    font-weight: 500;
    color: ${Colors.DEFAULT_TEXT};
`;

export interface MenuItem {
    label: string;
    callback: (id: string, version?: string) => void;
}

interface MoreVertMenuProps {
    component: Component;
    menuItems: MenuItem[];
    hasComponentKind?: boolean;
}

const relativePositionedRoundeIconStyles = {
    position: "relative",
    lineHeight: 0,
    width: 30,
    height: 30,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 70,
    marginLeft: -10,
    background: Colors.NODE_BACKGROUND_PRIMARY,
    borderRadius: "50%",
    transform: "rotate(90deg)",
    border: `3px solid ${Colors.LIGHT_GREY}}`,
    transition: "transform 0.3s ease-in-out"
};

const absolutePositionedRoundeIconStyles = {
    position: "absolute",
    lineHeight: 0,
    width: 30,
    height: 30,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 110,
    marginLeft: -24,
    background: Colors.NODE_BACKGROUND_PRIMARY,
    borderRadius: "50%",
    transform: "rotate(90deg)",
    border: `3px solid ${Colors.LIGHT_GREY}}`,
    transition: "transform 0.3s ease-in-out"
};

export function MoreVertMenu(props: MoreVertMenuProps) {
    const { component, menuItems, hasComponentKind } = props;
    
    const contextMenuItems = menuItems.map((item) => {
        return {
            id: item.label,
            label: <ItemContainer>{item.label}</ItemContainer>,
            onClick: () => {
                item.callback(component.id, component.version);
            }
        };
    })

    return (
        <ContextMenu iconSx={hasComponentKind ? absolutePositionedRoundeIconStyles : relativePositionedRoundeIconStyles} menuItems={contextMenuItems}/>
    );
}
