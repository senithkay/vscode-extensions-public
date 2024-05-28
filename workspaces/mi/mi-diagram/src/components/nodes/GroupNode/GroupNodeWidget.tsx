/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useMemo, useState } from "react";
import styled from "@emotion/styled";
import { DiagramEngine, PortWidget } from "@projectstorm/react-diagrams-core";
import { GroupNodeModel } from "./GroupNodeModel";
import { Colors, NODE_DIMENSIONS, NODE_GAP } from "../../../resources/constants";
import { STNode } from "@wso2-enterprise/mi-syntax-tree/src";
import { Button, ClickAwayListener, Menu, MenuItem, Popover, Tooltip } from "@wso2-enterprise/ui-toolkit";
import { MoreVertIcon } from "../../../resources";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import SidePanelContext from "../../sidePanel/SidePanelContexProvider";
import { getMediatorIconsFromFont } from "../../../resources/icons/mediatorIcons/icons";
import { FirstCharToUpperCase } from "../../../utils/commons";

namespace S {
    export type NodeStyleProp = {
        selected: boolean;
        hovered: boolean;
        hasError: boolean;
        isActiveBreakpoint?: boolean;
    };
    export const Node = styled.div<NodeStyleProp>`
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        width: ${NODE_DIMENSIONS.GROUP.WIDTH - (NODE_DIMENSIONS.BORDER * 2)}px;
        height: ${NODE_DIMENSIONS.GROUP.HEIGHT - (NODE_DIMENSIONS.BORDER * 2)}px;
        border: ${NODE_DIMENSIONS.BORDER}px solid
            ${(props: NodeStyleProp) =>
            props.hasError
                ? Colors.ERROR
                : props.selected
                    ? Colors.SECONDARY
                    : props.hovered
                        ? Colors.SECONDARY
                        : Colors.OUTLINE_VARIANT};
        border-radius: 10px;
        background-color: ${(props: NodeStyleProp) => props?.isActiveBreakpoint ? Colors.DEBUGGER_BREAKPOINT_BACKGROUND : Colors.SURFACE_BRIGHT};
        color: ${Colors.ON_SURFACE};
        cursor: pointer;
    `;

    export const Header = styled.div<{}>`
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
    `;

    export const IconContainer = styled.div`
        padding: 0 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        & img {
            height: 25px;
            width: 25px;
            fill: ${Colors.ON_SURFACE};
            stroke: ${Colors.ON_SURFACE};
        }
    `;

    export const StyledButton = styled(Button)`
        background-color: ${Colors.SURFACE};
        border-radius: 5px;
        position: absolute;
        right: 6px;
    `;

    export const TopPortWidget = styled(PortWidget)`
        margin-top: -3px;
    `;

    export const BottomPortWidget = styled(PortWidget)`
        margin-bottom: -3px;
    `;

    export const NodeText = styled.div`
        max-width: 100px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    `;

    export type ContainerStyleProp = {
        height: number;
        width: number;
    };
    export const ChildNodeContainer = styled.div<ContainerStyleProp>`
        position: absolute;
        top: ${NODE_DIMENSIONS.GROUP.HEIGHT / 2}px;
        left: ${(props: ContainerStyleProp) => ((NODE_DIMENSIONS.GROUP.WIDTH - props.width) / 2) - NODE_GAP.GROUP_NODE_HORIZONTAL_PADDING}px;
        width: ${(props: ContainerStyleProp) => props.width - (NODE_DIMENSIONS.BORDER * 2)}px;
        height: ${(props: ContainerStyleProp) => props.height - (NODE_DIMENSIONS.GROUP.HEIGHT / 2) - (NODE_DIMENSIONS.BORDER * 2)}px;
        padding: 0 ${NODE_GAP.GROUP_NODE_HORIZONTAL_PADDING}px;
        border: ${NODE_DIMENSIONS.BORDER}px dashed ${Colors.OUTLINE_VARIANT};
        border-radius: 10px;
        background-color: transparent;
        z-index: -1;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        pointer-events: none;
    `;

    export const EmptyEl = styled.div`
        width: 0;
        height: 0;
    `;

    export const TooltipContent = styled.div`
        max-width: 80vw;
        white-space: pre-wrap;
    `;
}

interface CallNodeWidgetProps {
    node: GroupNodeModel;
    engine: DiagramEngine;
    onClick?: (node: STNode) => void;
}

export function GroupNodeWidget(props: CallNodeWidgetProps) {
    const { node, engine } = props;
    const [isHovered, setIsHovered] = React.useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
    const sidePanelContext = React.useContext(SidePanelContext);
    const { rpcClient } = useVisualizerContext();
    const hasDiagnotics = node.hasDiagnotics();
    const hasBreakpoint = node.hasBreakpoint();
    const isActiveBreakpoint = node.isActiveBreakpoint();
    const tooltip = hasDiagnotics
        ? node
            .getDiagnostics()
            .map((diagnostic) => diagnostic.message)
            .join("\n")
        : undefined;

    const handleOnClickMenu = (event: any) => {
        setIsPopoverOpen(!isPopoverOpen);
        setPopoverAnchorEl(event.currentTarget);
        event.stopPropagation();
    };

    const handlePopoverClose = () => {
        setIsPopoverOpen(false);
    };

    const handleAddBreakpoint = async () => {
        const file = node.documentUri;
        const line = node.stNode.range.startTagRange.start.line;
        const request = {
            filePath: file,
            breakpoint: {
                line: line
            }
        }

        await rpcClient.getMiDebuggerRpcClient().addBreakpointToSource(request);
    };

    const removeBreakpoint = async () => {
        const file = node.documentUri;
        const line = node.stNode.range.startTagRange.start.line;
        const request = {
            filePath: file,
            breakpoint: {
                line: line
            }
        }

        await rpcClient.getMiDebuggerRpcClient().removeBreakpointFromSource(request);
    };

    const TooltipEl = useMemo(() => {
        return () => (
            <S.TooltipContent style={{ textWrap: "wrap" }}>
                {tooltip}
            </S.TooltipContent>
        );
    }, [tooltip])

    return (
        <div>
            <Tooltip content={!isPopoverOpen && tooltip ? <TooltipEl /> : ""} position={"bottom"} containerPosition={"absolute"}>
                <S.Node
                    selected={node.isSelected()}
                    hasError={hasDiagnotics}
                    hovered={isHovered || isActiveBreakpoint}
                    isActiveBreakpoint={isActiveBreakpoint}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={(e) => node.onClicked(e, node, rpcClient, sidePanelContext)}
                >
                    {hasBreakpoint && (
                        <div style={{ position: "absolute", left: -5, width: 15, height: 15, borderRadius: "50%", backgroundColor: "red" }}></div>
                    )}
                    <S.TopPortWidget port={node.getPort("in")!} engine={engine} />
                    <S.Header>
                        <S.IconContainer>{getMediatorIconsFromFont(node.stNode.tag)}</S.IconContainer>
                        <S.NodeText>{FirstCharToUpperCase(node.stNode.tag)}</S.NodeText>
                        {isHovered && (
                            <S.StyledButton appearance="icon" onClick={handleOnClickMenu}>
                                <MoreVertIcon />
                            </S.StyledButton>
                        )}
                    </S.Header>
                    <S.EmptyEl />
                </S.Node>
            </Tooltip>
            <S.ChildNodeContainer width={node.stNode.viewState.fw} height={node.stNode.viewState.fh}>
                <S.BottomPortWidget port={node.getPort("out")!} engine={engine} />
            </S.ChildNodeContainer>
            <Popover
                anchorEl={popoverAnchorEl}
                open={isPopoverOpen}
                sx={{
                    backgroundColor: Colors.SURFACE,
                    marginLeft: "30px",
                    padding: 0,
                }}
            >
                <ClickAwayListener onClickAway={handlePopoverClose}>
                    <Menu>
                        <MenuItem
                            key={"delete-btn"}
                            item={{ label: "Delete", id: "delete", onClick: () => node.delete(rpcClient) }}
                        />
                        {hasBreakpoint ?
                            <MenuItem key={'remove-breakpoint-btn'} item={{ label: 'Remove Breakpoint', id: "removeBreakpoint", onClick: removeBreakpoint }} /> :
                            <MenuItem key={'breakpoint-btn'} item={{ label: 'Add Breakpoint', id: "addBreakpoint", onClick: handleAddBreakpoint }} />
                        }
                    </Menu>
                </ClickAwayListener>
            </Popover>
        </div>
    );
}
