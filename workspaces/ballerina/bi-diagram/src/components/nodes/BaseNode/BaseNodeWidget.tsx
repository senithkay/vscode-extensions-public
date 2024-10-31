/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from "react";
import styled from "@emotion/styled";
import { DiagramEngine, PortWidget } from "@projectstorm/react-diagrams-core";
import {
    Colors,
    DRAFT_NODE_BORDER_WIDTH,
    NODE_BORDER_WIDTH,
    NODE_HEIGHT,
    NODE_PADDING,
    NODE_WIDTH,
} from "../../../resources/constants";
import { Button, Icon, Item, Menu, MenuItem, Popover, Tooltip } from "@wso2-enterprise/ui-toolkit";
import { MoreVertIcon } from "../../../resources";
import NodeIcon from "../../NodeIcon";
import { useDiagramContext } from "../../DiagramContext";
import { BaseNodeModel } from "./BaseNodeModel";
import { ELineRange, FlowNode } from "@wso2-enterprise/ballerina-core";

export namespace NodeStyles {
    export type NodeStyleProp = {
        disabled: boolean;
        hovered: boolean;
        hasError: boolean;
    };
    export const Node = styled.div<NodeStyleProp>`
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        width: ${NODE_WIDTH}px;
        min-height: ${NODE_HEIGHT}px;
        padding: 0 ${NODE_PADDING}px;
        background-color: ${Colors.SURFACE_DIM};
        color: ${Colors.ON_SURFACE};
        opacity: ${(props: NodeStyleProp) => (props.disabled ? 0.7 : 1)};
        border: ${(props: NodeStyleProp) => (props.disabled ? DRAFT_NODE_BORDER_WIDTH : NODE_BORDER_WIDTH)}px;
        border-style: ${(props: NodeStyleProp) => (props.disabled ? "dashed" : "solid")};
        border-color: ${(props: NodeStyleProp) =>
            props.hasError ? Colors.ERROR : props.hovered && !props.disabled ? Colors.PRIMARY : Colors.OUTLINE_VARIANT};
        border-radius: 10px;
        cursor: pointer;
    `;

    export const Header = styled.div<{}>`
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: 2px;
        width: 100%;
        padding: 8px;
    `;

    export const ActionButtonGroup = styled.div`
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
        gap: 2px;
    `;

    export const MenuButton = styled(Button)`
        border-radius: 5px;
    `;

    export const ErrorIcon = styled.div`
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: ${Colors.ERROR};
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
        max-width: ${NODE_WIDTH - 80}px;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: monospace;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        color: ${Colors.ON_SURFACE};
        opacity: 0.7;
        white-space: normal;
        font-size: 12px;
        line-height: 14px;
        max-height: 28px;
    `;

    export const Row = styled.div`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    `;

    export const Hr = styled.hr`
        width: 100%;
    `;

    export const Footer = styled(StyledText)`
        display: flex;
        align-items: center;
        gap: 8px;
    `;
}

export interface BaseNodeWidgetProps {
    model: BaseNodeModel;
    engine: DiagramEngine;
    onClick?: (node: FlowNode) => void;
}

export interface NodeWidgetProps extends Omit<BaseNodeWidgetProps, "children"> {}

export function BaseNodeWidget(props: BaseNodeWidgetProps) {
    const { model, engine, onClick } = props;
    const { projectPath, onNodeSelect, goToSource, openView, onDeleteNode } = useDiagramContext();

    const [isHovered, setIsHovered] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | SVGSVGElement>(null);
    const isMenuOpen = Boolean(anchorEl);

    const handleOnClick = async (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.metaKey) {
            // Handle action when cmd key is pressed
            if (model.node.codedata.node === "DATA_MAPPER") {
                openDataMapper();
            } else if (model.node.codedata.node === "FUNCTION_CALL") {
                viewFunction();
            } else {
                onGoToSource();
            }
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
    };

    const handleOnMenuClick = (event: React.MouseEvent<HTMLElement | SVGSVGElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleOnMenuClose = () => {
        setAnchorEl(null);
    };

    const openDataMapper = () => {
        if (!model.node.properties?.view?.value) {
            return;
        }
        const { fileName, startLine, endLine } = model.node.properties.view.value as ELineRange;
        openView &&
            openView(projectPath + "/" + fileName, {
                startLine: startLine.line,
                startColumn: startLine.offset,
                endLine: endLine.line,
                endColumn: endLine.offset,
            });
    };

    const viewFunction = () => {
        if (!model.node.properties?.view?.value) {
            return;
        }
        const { fileName, startLine, endLine } = model.node.properties.view.value as ELineRange;
        openView &&
            openView(projectPath + "/" + fileName, {
                startLine: startLine.line,
                startColumn: startLine.offset,
                endLine: endLine.line,
                endColumn: endLine.offset,
            });
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

    if (model.node.codedata.node === "DATA_MAPPER") {
        menuItems.splice(1, 0, {
            id: "openDataMapper",
            label: "View",
            onClick: () => {
                openDataMapper();
            },
        });
    }

    if (model.node.codedata.node === "FUNCTION_CALL") {
        menuItems.splice(1, 0, {
            id: "viewFunction",
            label: "View",
            onClick: () => {
                viewFunction();
            },
        });
    }

    const hasFullAssignment = model.node.properties?.variable?.value && model.node.properties?.expression?.value;

    return (
        <NodeStyles.Node
            hovered={isHovered}
            disabled={model.node.suggested}
            hasError={model.node.diagnostics?.hasDiagnostics ?? false}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <NodeStyles.TopPortWidget port={model.getPort("in")!} engine={engine} />
            <NodeStyles.Row>
                <NodeStyles.Icon onClick={handleOnClick}>
                    <NodeIcon type={model.node.codedata.node} />
                    {/* {model.node.properties.variable?.value && (
                        <NodeStyles.Description>{model.node.properties.variable.value}</NodeStyles.Description>
                    )} */}
                </NodeStyles.Icon>
                <NodeStyles.Row>
                    <NodeStyles.Header onClick={handleOnClick}>
                        <NodeStyles.Title>{model.node.metadata.label || model.node.codedata.node}</NodeStyles.Title>
                        {hasFullAssignment && (
                            <NodeStyles.Description>{`${model.node.properties.variable?.value} = ${model.node.properties?.expression?.value}`}</NodeStyles.Description>
                        )}
                        {!hasFullAssignment && (
                            <NodeStyles.Description>
                                {model.node.properties?.variable?.value || model.node.properties?.expression?.value}
                            </NodeStyles.Description>
                        )}
                    </NodeStyles.Header>
                    <NodeStyles.ActionButtonGroup>
                        {model.node.diagnostics?.hasDiagnostics && (
                            <NodeStyles.ErrorIcon>
                                <Icon name="error-outline-rounded" />
                            </NodeStyles.ErrorIcon>
                        )}
                        <NodeStyles.MenuButton appearance="icon" onClick={handleOnMenuClick}>
                            <MoreVertIcon />
                        </NodeStyles.MenuButton>
                    </NodeStyles.ActionButtonGroup>
                </NodeStyles.Row>
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
            <NodeStyles.BottomPortWidget port={model.getPort("out")!} engine={engine} />
        </NodeStyles.Node>
    );
}
