/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { DiagramEngine, PortWidget } from "@projectstorm/react-diagrams-core";
import { AgentCallNodeModel } from "./AgentCallNodeModel";
import {
    AGENT_NODE_TOOL_GAP,
    AGENT_NODE_TOOL_SECTION_GAP,
    DRAFT_NODE_BORDER_WIDTH,
    LABEL_HEIGHT,
    LABEL_WIDTH,
    NODE_BORDER_WIDTH,
    NODE_GAP_X,
    NODE_HEIGHT,
    NODE_PADDING,
    NODE_WIDTH,
} from "../../../resources/constants";
import { Button, Icon, Item, Menu, MenuItem, Popover, ThemeColors } from "@wso2-enterprise/ui-toolkit";
import { MoreVertIcon } from "../../../resources";
import { AgentNodeTools, FlowNode } from "../../../utils/types";
import NodeIcon from "../../NodeIcon";
import ConnectorIcon from "../../ConnectorIcon";
import { useDiagramContext } from "../../DiagramContext";
import { DiagnosticsPopUp } from "../../DiagnosticsPopUp";
import { getAgentNodeTools, getNodeTitle, nodeHasError } from "../../../utils/node";
import { BreakpointMenu } from "../../BreakNodeMenu/BreakNodeMenu";

export namespace NodeStyles {
    export const Node = styled.div`
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        cursor: pointer;
    `;

    export type NodeStyleProp = {
        disabled: boolean;
        hovered: boolean;
        hasError: boolean;
        isActiveBreakpoint: boolean;
    };
    export const Box = styled.div<NodeStyleProp>`
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        width: ${NODE_WIDTH}px;
        min-height: ${NODE_HEIGHT}px;
        padding: 0 ${NODE_PADDING}px;
        opacity: ${(props: NodeStyleProp) => (props.disabled ? 0.7 : 1)};
        border: ${(props: NodeStyleProp) => (props.disabled ? DRAFT_NODE_BORDER_WIDTH : NODE_BORDER_WIDTH)}px;
        border-style: ${(props: NodeStyleProp) => (props.disabled ? "dashed" : "solid")};
        border-color: ${(props: NodeStyleProp) =>
            props.hasError
                ? ThemeColors.ERROR
                : props.hovered && !props.disabled
                ? ThemeColors.PRIMARY
                : ThemeColors.OUTLINE_VARIANT};
        border-radius: 10px;
        background-color: ${(props: NodeStyleProp) =>
            props?.isActiveBreakpoint ? ThemeColors.DEBUGGER_BREAKPOINT_BACKGROUND : ThemeColors.SURFACE_DIM};
        color: ${ThemeColors.ON_SURFACE};
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

    export const StyledButton = styled(Button)`
        border-radius: 5px;
        position: absolute;
        right: 136px;
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
            fill: ${ThemeColors.ON_SURFACE};
        }
    `;

    export const Title = styled(StyledText)`
        max-width: ${NODE_WIDTH - 80}px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: "GilmerMedium";
    `;

    export const Description = styled(StyledText)`
        font-size: 12px;
        max-width: ${NODE_WIDTH - 80}px;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: monospace;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        color: ${ThemeColors.ON_SURFACE};
        opacity: 0.7;
    `;

    export const Row = styled.div`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 100%;
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
        color: ${ThemeColors.ERROR};
    `;

    export const Hr = styled.hr`
        width: 100%;
    `;

    export const Footer = styled(StyledText)`
        display: flex;
        align-items: center;
        gap: 8px;
    `;

    export type PillStyleProp = {
        color: string;
    };
    export const Pill = styled.div<PillStyleProp>`
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        color: ${(props: PillStyleProp) => props.color};
        padding: 2px 4px;
        border-radius: 20px;
        border: 1px solid ${(props: PillStyleProp) => props.color};
        font-size: 12px;
        font-family: monospace;
        svg {
            fill: ${(props: PillStyleProp) => props.color};
            stroke: ${(props: PillStyleProp) => props.color};
            height: 12px;
            width: 12px;
        }
    `;
}

interface AgentCallNodeWidgetProps {
    model: AgentCallNodeModel;
    engine: DiagramEngine;
    onClick?: (node: FlowNode) => void;
}

export interface NodeWidgetProps extends Omit<AgentCallNodeWidgetProps, "children"> {}

export function AgentCallNodeWidget(props: AgentCallNodeWidgetProps) {
    const { model, engine, onClick } = props;
    const { onNodeSelect, onConnectionSelect, goToSource, onDeleteNode, removeBreakpoint, addBreakpoint, readOnly } =
        useDiagramContext();

    const [isBoxHovered, setIsBoxHovered] = useState(false);
    const [isCircleHovered, setIsCircleHovered] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | SVGSVGElement>(null);
    const isMenuOpen = Boolean(anchorEl);
    const hasBreakpoint = model.hasBreakpoint();
    const isActiveBreakpoint = model.isActiveBreakpoint();

    useEffect(() => {
        if (model.node.suggested) {
            model.setAroundLinksDisabled(model.node.suggested === true);
        }
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

    const onConnectionClick = () => {
        onConnectionSelect && onConnectionSelect(model.node.properties?.connection?.value as string);
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

    const onAddBreakpoint = () => {
        addBreakpoint && addBreakpoint(model.node);
        setAnchorEl(null);
    };

    const onRemoveBreakpoint = () => {
        removeBreakpoint && removeBreakpoint(model.node);
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
    const nodeTitle = getNodeTitle(model.node);
    const hasError = nodeHasError(model.node);
    const tools = getAgentNodeTools(model.node);

    return (
        <NodeStyles.Node>
            <NodeStyles.Box
                disabled={disabled}
                hovered={isBoxHovered}
                hasError={hasError}
                isActiveBreakpoint={isActiveBreakpoint}
                onMouseEnter={() => setIsBoxHovered(true)}
                onMouseLeave={() => setIsBoxHovered(false)}
                style={{ height: `${model.node.viewState?.ch}px` }}
            >
                {hasBreakpoint && (
                    <div
                        style={{
                            position: "absolute",
                            left: -5,
                            width: 15,
                            height: 15,
                            borderRadius: "50%",
                            backgroundColor: "red",
                        }}
                    />
                )}
                <NodeStyles.TopPortWidget port={model.getPort("in")!} engine={engine} />
                <NodeStyles.Row>
                    <NodeStyles.Icon onClick={handleOnClick}>
                        <NodeIcon type={model.node.codedata.node} size={24} />
                    </NodeStyles.Icon>
                    <NodeStyles.Row>
                        <NodeStyles.Header onClick={handleOnClick}>
                            <NodeStyles.Title>{nodeTitle}</NodeStyles.Title>
                            <NodeStyles.Description>{model.node.properties.variable?.value}</NodeStyles.Description>
                        </NodeStyles.Header>
                        <NodeStyles.ActionButtonGroup>
                            {hasError && <DiagnosticsPopUp node={model.node} />}
                            {!readOnly && (
                                <NodeStyles.MenuButton appearance="icon" onClick={handleOnMenuClick}>
                                    <MoreVertIcon />
                                </NodeStyles.MenuButton>
                            )}
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
                            <>
                                {menuItems.map((item) => (
                                    <MenuItem key={item.id} item={item} />
                                ))}
                                <BreakpointMenu
                                    hasBreakpoint={hasBreakpoint}
                                    onAddBreakpoint={onAddBreakpoint}
                                    onRemoveBreakpoint={onRemoveBreakpoint}
                                />
                            </>
                        </Menu>
                    </Popover>
                </NodeStyles.Row>
                <NodeStyles.BottomPortWidget port={model.getPort("out")!} engine={engine} />
            </NodeStyles.Box>

            <svg
                width={NODE_GAP_X + NODE_HEIGHT + LABEL_HEIGHT + LABEL_WIDTH}
                height={NODE_HEIGHT * 2 + (tools.length || 0) * (NODE_HEIGHT + LABEL_HEIGHT)}
                viewBox={`0 0 300 ${70 + (tools.length || 0) * 70}`}
                onMouseEnter={() => setIsCircleHovered(true)}
                onMouseLeave={() => setIsCircleHovered(false)}
            >
                {/* ai agent model circle */}
                <g>
                    <circle
                        cx="80"
                        cy="24"
                        r="22"
                        fill={ThemeColors.SURFACE_DIM}
                        stroke={isCircleHovered && !disabled ? ThemeColors.PRIMARY : ThemeColors.OUTLINE_VARIANT}
                        strokeWidth={1.5}
                        strokeDasharray={disabled ? "5 5" : "none"}
                        opacity={disabled ? 0.7 : 1}
                    />
                    <foreignObject x="68" y="12" width="44" height="44" fill={ThemeColors.ON_SURFACE}>
                        <ConnectorIcon node={model.node} />
                    </foreignObject>
                    <line
                        x1="0"
                        y1="25"
                        x2="57"
                        y2="25"
                        style={{
                            stroke: disabled
                                ? ThemeColors.ON_SURFACE
                                : isBoxHovered
                                ? ThemeColors.PRIMARY
                                : ThemeColors.ON_SURFACE,
                            strokeWidth: 1.5,
                            markerEnd: `url(#${model.node.id}-arrow-head)`,
                        }}
                    />
                </g>

                {/* circles for tools */}
                {tools.map((tool: AgentNodeTools, index: number) => (
                    <g
                        key={index}
                        transform={`translate(0, ${
                            (index + 1) * (NODE_HEIGHT + AGENT_NODE_TOOL_GAP) + AGENT_NODE_TOOL_SECTION_GAP
                        })`}
                    >
                        <circle
                            cx="80"
                            cy="24"
                            r="22"
                            fill={ThemeColors.SURFACE_DIM}
                            stroke={ThemeColors.OUTLINE_VARIANT}
                            strokeWidth={1.5}
                            strokeDasharray={disabled ? "5 5" : "none"}
                            opacity={disabled ? 0.7 : 1}
                        />
                        <foreignObject x="68" y="12" width="44" height="44" fill={ThemeColors.ON_SURFACE}>
                            <ConnectorIcon node={undefined} url={tool.iconUrl} />
                        </foreignObject>
                        <text
                            x="110"
                            y="28"
                            textAnchor="start"
                            fill={ThemeColors.ON_SURFACE}
                            fontSize="14px"
                            fontFamily="GilmerRegular"
                            dominantBaseline="middle"
                        >
                            {tool.name.length > 20 ? `${tool.name.slice(0, 20)}...` : tool.name}
                            <title>{tool.name}</title>
                        </text>
                        <line
                            x1="0"
                            y1="25"
                            x2="57"
                            y2="25"
                            style={{
                                stroke: ThemeColors.ON_SURFACE,
                                strokeWidth: 1.5,
                                markerEnd: `url(#${model.node.id}-arrow-head-tool-${tool.name})`,
                            }}
                        />
                    </g>
                ))}

                <defs>
                    <marker
                        id={`${model.node.id}-arrow-head`}
                        markerWidth="4"
                        markerHeight="4"
                        refX="3"
                        refY="2"
                        viewBox="0 0 4 4"
                        orient="auto"
                    >
                        <polygon points="0,4 0,0 4,2" fill={ThemeColors.ON_SURFACE}></polygon>
                    </marker>
                    {tools.map((tool: AgentNodeTools) => (
                        <marker
                            key={tool.name}
                            id={`${model.node.id}-arrow-head-tool-${tool.name}`}
                            markerWidth="4"
                            markerHeight="4"
                            refX="3"
                            refY="2"
                            viewBox="0 0 4 4"
                            orient="auto"
                        >
                            <polygon points="0,4 0,0 4,2" fill={ThemeColors.ON_SURFACE}></polygon>
                        </marker>
                    ))}
                </defs>
            </svg>
        </NodeStyles.Node>
    );
}
