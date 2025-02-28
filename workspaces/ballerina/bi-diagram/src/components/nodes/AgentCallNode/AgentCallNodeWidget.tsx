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
    DRAFT_NODE_BORDER_WIDTH,
    LABEL_HEIGHT,
    NODE_BORDER_WIDTH,
    NODE_GAP_X,
    NODE_HEIGHT,
    NODE_PADDING,
    NODE_WIDTH,
} from "../../../resources/constants";
import { Button, Item, Menu, MenuItem, Popover, ThemeColors } from "@wso2-enterprise/ui-toolkit";
import { MoreVertIcon } from "../../../resources";
import { FlowNode } from "../../../utils/types";
import NodeIcon from "../../NodeIcon";
import ConnectorIcon from "../../ConnectorIcon";
import { useDiagramContext } from "../../DiagramContext";
import { DiagnosticsPopUp } from "../../DiagnosticsPopUp";
import { getNodeTitle, nodeHasError } from "../../../utils/node";
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
                width={NODE_GAP_X + NODE_HEIGHT + LABEL_HEIGHT}
                height={NODE_HEIGHT * 2 + (model.node.metadata?.tools?.length || 0) * (NODE_HEIGHT + LABEL_HEIGHT)}
                viewBox={`0 0 130 ${70 + (model.node.metadata?.tools?.length || 0) * 70}`}
                onClick={onConnectionClick}
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
                        {/* <ConnectorIcon node={model.node} /> */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            x="0px"
                            y="0px"
                            width="24"
                            height="24"
                            viewBox="0 0 50 50"
                        >
                            <path d="M45.403,25.562c-0.506-1.89-1.518-3.553-2.906-4.862c1.134-2.665,0.963-5.724-0.487-8.237	c-1.391-2.408-3.636-4.131-6.322-4.851c-1.891-0.506-3.839-0.462-5.669,0.088C28.276,5.382,25.562,4,22.647,4	c-4.906,0-9.021,3.416-10.116,7.991c-0.01,0.001-0.019-0.003-0.029-0.002c-2.902,0.36-5.404,2.019-6.865,4.549	c-1.391,2.408-1.76,5.214-1.04,7.9c0.507,1.891,1.519,3.556,2.909,4.865c-1.134,2.666-0.97,5.714,0.484,8.234	c1.391,2.408,3.636,4.131,6.322,4.851c0.896,0.24,1.807,0.359,2.711,0.359c1.003,0,1.995-0.161,2.957-0.45	C21.722,44.619,24.425,46,27.353,46c4.911,0,9.028-3.422,10.12-8.003c2.88-0.35,5.431-2.006,6.891-4.535	C45.754,31.054,46.123,28.248,45.403,25.562z M35.17,9.543c2.171,0.581,3.984,1.974,5.107,3.919c1.049,1.817,1.243,4,0.569,5.967	c-0.099-0.062-0.193-0.131-0.294-0.19l-9.169-5.294c-0.312-0.179-0.698-0.177-1.01,0.006l-10.198,6.041l-0.052-4.607l8.663-5.001	C30.733,9.26,33,8.963,35.17,9.543z M29.737,22.195l0.062,5.504l-4.736,2.805l-4.799-2.699l-0.062-5.504l4.736-2.805L29.737,22.195z M14.235,14.412C14.235,9.773,18.009,6,22.647,6c2.109,0,4.092,0.916,5.458,2.488C28,8.544,27.891,8.591,27.787,8.651l-9.17,5.294	c-0.312,0.181-0.504,0.517-0.5,0.877l0.133,11.851l-4.015-2.258V14.412z M6.528,23.921c-0.581-2.17-0.282-4.438,0.841-6.383	c1.06-1.836,2.823-3.074,4.884-3.474c-0.004,0.116-0.018,0.23-0.018,0.348V25c0,0.361,0.195,0.694,0.51,0.872l10.329,5.81	L19.11,34.03l-8.662-5.002C8.502,27.905,7.11,26.092,6.528,23.921z M14.83,40.457c-2.171-0.581-3.984-1.974-5.107-3.919	c-1.053-1.824-1.249-4.001-0.573-5.97c0.101,0.063,0.196,0.133,0.299,0.193l9.169,5.294c0.154,0.089,0.327,0.134,0.5,0.134	c0.177,0,0.353-0.047,0.51-0.14l10.198-6.041l0.052,4.607l-8.663,5.001C19.269,40.741,17.001,41.04,14.83,40.457z M35.765,35.588	c0,4.639-3.773,8.412-8.412,8.412c-2.119,0-4.094-0.919-5.459-2.494c0.105-0.056,0.216-0.098,0.32-0.158l9.17-5.294	c0.312-0.181,0.504-0.517,0.5-0.877L31.75,23.327l4.015,2.258V35.588z M42.631,32.462c-1.056,1.83-2.84,3.086-4.884,3.483	c0.004-0.12,0.018-0.237,0.018-0.357V25c0-0.361-0.195-0.694-0.51-0.872l-10.329-5.81l3.964-2.348l8.662,5.002	c1.946,1.123,3.338,2.937,3.92,5.107C44.053,28.249,43.754,30.517,42.631,32.462z"></path>
                        </svg>
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
                {model.node.metadata?.tools?.map((tool: any, index: number) => (
                    <g key={index} transform={`translate(0, ${(index + 1) * 70})`}>
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
                                markerEnd: `url(#${model.node.id}-arrow-head-${index})`,
                            }}
                        />
                    </g>
                ))}

                <defs>
                    <marker
                        markerWidth="4"
                        markerHeight="4"
                        refX="3"
                        refY="2"
                        viewBox="0 0 4 4"
                        orient="auto"
                        id={`${model.node.id}-arrow-head`}
                    >
                        <polygon
                            points="0,4 0,0 4,2"
                            fill={
                                disabled
                                    ? ThemeColors.ON_SURFACE
                                    : isBoxHovered
                                    ? ThemeColors.PRIMARY
                                    : ThemeColors.ON_SURFACE
                            }
                        ></polygon>
                    </marker>
                    {model.node.metadata?.tools?.map((_, index: number) => (
                        <marker
                            key={index}
                            markerWidth="4"
                            markerHeight="4"
                            refX="3"
                            refY="2"
                            viewBox="0 0 4 4"
                            orient="auto"
                            id={`${model.node.id}-arrow-head-${index}`}
                        >
                            <polygon
                                points="0,4 0,0 4,2"
                                fill={
                                    disabled
                                        ? ThemeColors.ON_SURFACE
                                        : isBoxHovered
                                        ? ThemeColors.PRIMARY
                                        : ThemeColors.ON_SURFACE
                                }
                            ></polygon>
                        </marker>
                    ))}
                </defs>
            </svg>
        </NodeStyles.Node>
    );
}
