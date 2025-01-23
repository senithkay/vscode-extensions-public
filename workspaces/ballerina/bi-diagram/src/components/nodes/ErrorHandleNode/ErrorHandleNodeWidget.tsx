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
import { ErrorHandleNodeModel } from "./ErrorHandleNodeModel";
import {
    Colors,
    WHILE_NODE_WIDTH,
    NODE_BORDER_WIDTH,
    NODE_WIDTH,
    NODE_GAP_X,
    ERROR_HANDLER_NODE_WIDTH,
    CONTAINER_PADDING,
} from "../../../resources/constants";
import { Button, Item, Menu, MenuItem, Popover } from "@wso2-enterprise/ui-toolkit";
import { FlowNode } from "../../../utils/types";
import { useDiagramContext } from "../../DiagramContext";
import { MoreVertIcon } from "../../../resources";
import { DiagnosticsPopUp } from "../../DiagnosticsPopUp";
import { nodeHasError } from "../../../utils/node";
import { BreakpointMenu } from "../../BreakNodeMenu/BreakNodeMenu";

export namespace NodeStyles {
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
        top: -8px;
        left: 48px;
    `;

    export const ErrorIcon = styled.div`
        position: absolute;
        bottom: -8px;
        left: 48px;
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

    export type NodeStyleProp = {
        selected: boolean;
        hovered: boolean;
        hasError: boolean;
        isActiveBreakpoint?: boolean;
    };
    export const Box = styled.div<NodeStyleProp>`
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        border: ${NODE_BORDER_WIDTH}px solid
            ${(props: NodeStyleProp) =>
                props.hasError ? Colors.ERROR : props.hovered ? Colors.PRIMARY : Colors.OUTLINE_VARIANT};
        border-radius: 8px;
        background-color: ${(props: NodeStyleProp) =>
            props?.isActiveBreakpoint ? Colors.DEBUGGER_BREAKPOINT_BACKGROUND : Colors.SURFACE_DIM};
        width: ${ERROR_HANDLER_NODE_WIDTH}px;
        height: ${ERROR_HANDLER_NODE_WIDTH}px;
    `;

    export const Hr = styled.hr`
        width: 100%;
    `;

    export type ContainerStyleProp = {
        width: number;
        height: number;
        top: number;
        left: number;
    };
    export const Container = styled.div<ContainerStyleProp>`
        position: fixed;
        width: ${(props) => props.width}px;
        height: ${(props) => props.height}px;
        top: ${(props) => props.top}px;
        left: ${(props) => props.left}px;

        border: 2px dashed ${Colors.OUTLINE_VARIANT};
        border-radius: 10px;
        background-color: transparent;
        z-index: -1;
        display: flex;
        align-items: flex-end;
        pointer-events: none;
    `;
}

interface ErrorHandleNodeWidgetProps {
    model: ErrorHandleNodeModel;
    engine: DiagramEngine;
    onClick?: (node: FlowNode) => void;
}

export interface NodeWidgetProps extends Omit<ErrorHandleNodeWidgetProps, "children"> {}

export function ErrorHandleNodeWidget(props: ErrorHandleNodeWidgetProps) {
    const { model, engine, onClick } = props;
    const { onNodeSelect, goToSource, onDeleteNode, addBreakpoint, removeBreakpoint, readOnly } = useDiagramContext();

    const [isHovered, setIsHovered] = React.useState(false);
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

    const onGoToSource = () => {
        goToSource && goToSource(model.node);
        setAnchorEl(null);
    };

    const deleteNode = () => {
        onDeleteNode && onDeleteNode(model.node);
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
    const hasError = nodeHasError(model.node);
    const nodeViewState = model.node.viewState;

    return (
        <NodeStyles.Node>
            <NodeStyles.Row>
                <NodeStyles.Column>
                    <NodeStyles.Box
                        onClick={handleOnClick}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        selected={model.isSelected()}
                        hovered={isHovered}
                        hasError={hasError}
                        isActiveBreakpoint={isActiveBreakpoint}
                    >
                        {hasBreakpoint && (
                            <div
                                style={{
                                    position: "absolute",
                                    left: 1,
                                    width: 15,
                                    height: 15,
                                    borderRadius: "50%",
                                    backgroundColor: "red",
                                }}
                            />
                        )}
                        <NodeStyles.TopPortWidget port={model.getPort("in")!} engine={engine} />
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 12 12">
                            <path
                                fill={Colors.ON_SURFACE}
                                d="M6.014 10.99c-.05 0-.11 0-.16-.03c-4.439-1.47-4.379-4.84-4.348-7.29v-.68c0-.28.22-.5.5-.5c.02 0 2.315-.02 3.637-1.35c.19-.19.521-.19.711 0c1.333 1.33 3.617 1.35 3.637 1.35c.28 0 .5.22.5.5v.68c.041 2.45.101 5.81-4.337 7.3c-.05.02-.1.03-.16.03zM2.517 3.47v.22c-.04 2.35-.09 5 3.497 6.28C9.6 8.7 9.55 6.04 9.51 3.69v-.22c-.771-.07-2.304-.34-3.496-1.3c-1.192.96-2.715 1.23-3.497 1.3"
                            />
                        </svg>
                        <NodeStyles.BottomPortWidget port={model.getPort("out")!} engine={engine} />
                    </NodeStyles.Box>
                </NodeStyles.Column>
                <NodeStyles.Header>
                    <NodeStyles.Title>{model.node.metadata.label || model.node.codedata.node}</NodeStyles.Title>
                    {model.node.properties?.condition && (
                        <NodeStyles.Description>{model.node.properties.condition?.value}</NodeStyles.Description>
                    )}
                </NodeStyles.Header>
                {!readOnly && (
                    <NodeStyles.StyledButton appearance="icon" onClick={handleOnMenuClick}>
                        <MoreVertIcon />
                    </NodeStyles.StyledButton>
                )}
                {hasError && (
                    <NodeStyles.ErrorIcon>
                        <DiagnosticsPopUp node={model.node} />
                    </NodeStyles.ErrorIcon>
                )}
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
            <NodeStyles.Container
                width={nodeViewState.clw + nodeViewState.crw + NODE_GAP_X / 2}
                height={nodeViewState.ch - nodeViewState.h + CONTAINER_PADDING}
                top={nodeViewState.y + nodeViewState.h - CONTAINER_PADDING}
                left={nodeViewState.x + nodeViewState.lw - nodeViewState.clw - NODE_GAP_X / 4}
            ></NodeStyles.Container>
        </NodeStyles.Node>
    );
}
