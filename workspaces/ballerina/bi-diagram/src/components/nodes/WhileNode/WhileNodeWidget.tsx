/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { DiagramEngine, PortWidget } from "@projectstorm/react-diagrams-core";
import { WhileNodeModel } from "./WhileNodeModel";
import { Colors, WHILE_NODE_WIDTH, NODE_BORDER_WIDTH, NODE_HEIGHT, NODE_WIDTH } from "../../../resources/constants";
import { Button, Item, Menu, MenuItem, Popover } from "@wso2-enterprise/ui-toolkit";
import { FlowNode } from "../../../utils/types";
import { useDiagramContext } from "../../DiagramContext";
import { MoreVertIcon } from "../../../resources";

export namespace NodeStyles {
    export type NodeStyleProp = {
        selected: boolean;
        hovered: boolean;
    };
    export const Node = styled.div`
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        color: ${Colors.ON_SURFACE};
        color: ${Colors.ON_SURFACE};
        cursor: pointer;
    `;

    export const Header = styled.div<{}>`
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        width: 100%;
        position: absolute;
        padding: 8px;
        left: ${WHILE_NODE_WIDTH}px;
    `;

    export const StyledButton = styled(Button)`
        border-radius: 5px;
        position: absolute;
        top: -6px;
        left: 46px;
    `;

    export const TopPortWidget = styled(PortWidget)`
        margin-top: -3px;
    `;

    export const BottomPortWidget = styled(PortWidget)`
        margin-bottom: -2px;
    `;

    export const StyledText = styled.div`
        font-size: 14px;
    `;

    export const Icon = styled.div`
        padding: 4px;
        svg {
            fill: ${Colors.ON_SURFACE};
        }
    `;

    export const Title = styled(StyledText)`
        max-width: ${NODE_WIDTH - 50}px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: "GilmerMedium";
    `;

    export const Description = styled(StyledText)`
        font-size: 12px;
        max-width: ${NODE_WIDTH - 50}px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: monospace;
    `;

    export const Row = styled.div`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    `;

    export const Column = styled.div`
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
    `;

    export const Circle = styled.div<NodeStyleProp>`
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        border: ${NODE_BORDER_WIDTH}px solid
        ${(props: NodeStyleProp) =>
            props.hovered ? Colors.PRIMARY : Colors.OUTLINE_VARIANT};
        border-radius: 50px;
        width: ${NODE_HEIGHT}px;
        height: ${NODE_HEIGHT}px;
    `;

    export const Hr = styled.hr`
        width: 100%;
    `;
}

interface WhileNodeWidgetProps {
    model: WhileNodeModel;
    engine: DiagramEngine;
    onClick?: (node: FlowNode) => void;
}

export interface NodeWidgetProps extends Omit<WhileNodeWidgetProps, "children"> { }

export function WhileNodeWidget(props: WhileNodeWidgetProps) {
    const { model, engine, onClick } = props;
    const { onNodeSelect, goToSource, onDeleteNode } = useDiagramContext();

    const [isHovered, setIsHovered] = React.useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | SVGSVGElement>(null);
    const isMenuOpen = Boolean(anchorEl);

    useEffect(() => {
        model.setAroundLinksDisabled(model.node.suggested);
    }, [model.node.suggested]);

    const handleOnClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.metaKey) {
            onGoToSource();
        } else {
            onNodeClick();
        }
    };

    const onNodeClick = () => {
        onClick && onClick(model.node);
        onNodeSelect && onNodeSelect(model.node);
        setAnchorEl(null);
    };

    const onGoToSource = () => {
        goToSource && goToSource(model.node);
        setAnchorEl(null);
    };

    const deleteNode = () => {
        onDeleteNode && onDeleteNode(model.node);
        setAnchorEl(null);
    }

    const handleOnMenuClick = (event: React.MouseEvent<HTMLElement | SVGSVGElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleOnMenuClose = () => {
        setAnchorEl(null);
    };

    const menuItems: Item[] = [
        {
            id: "edit",
            label: "Edit",
            onClick: () => onNodeClick(),
        },
        { id: "goToSource", label: "Source", onClick: () => onGoToSource() },
        { id: "delete", label: "Delete", onClick: () => deleteNode() },
    ];

    const disabled = model.node.suggested;

    return (
        <NodeStyles.Node>
            <NodeStyles.Row>
                <NodeStyles.Column>
                    <NodeStyles.Circle
                        onClick={handleOnClick}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        selected={model.isSelected()}
                        hovered={isHovered}
                    >
                        <NodeStyles.TopPortWidget port={model.getPort("in")!} engine={engine} />
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <g
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                                stroke={isHovered && !disabled ? Colors.PRIMARY : "currentColor"}
                            >
                                <path d="M12 3a9 9 0 1 1-5.657 2" />
                                <path d="M3 4.5h4v4" />
                            </g>
                        </svg>
                        <NodeStyles.BottomPortWidget port={model.getPort("out")!} engine={engine} />
                    </NodeStyles.Circle>
                </NodeStyles.Column>
                <NodeStyles.Header>
                    <NodeStyles.Title>{model.node.metadata.label || model.node.codedata.node}</NodeStyles.Title>
                    <NodeStyles.Description>{model.node.properties.condition?.value}</NodeStyles.Description>
                </NodeStyles.Header>
                <NodeStyles.StyledButton appearance="icon" onClick={handleOnMenuClick}>
                    <MoreVertIcon />
                </NodeStyles.StyledButton>
                <Popover
                    open={isMenuOpen}
                    anchorEl={anchorEl}
                    handleClose={handleOnMenuClose}
                    sx={{
                        padding: 0,
                        borderRadius: 0,
                    }}
                >
                    <Menu>
                        {menuItems.map((item) => (
                            <MenuItem key={item.id} item={item} />
                        ))}
                    </Menu>
                </Popover>
            </NodeStyles.Row>
        </NodeStyles.Node>
    );
}
