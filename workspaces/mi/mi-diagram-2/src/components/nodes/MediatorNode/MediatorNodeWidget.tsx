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
import { MediatorNodeModel } from "./MediatorNodeModel";
import { Colors, NODE_DIMENSIONS } from "../../../resources/constants";
import { STNode } from "@wso2-enterprise/mi-syntax-tree/src";
import { Button, ClickAwayListener, Menu, MenuItem, Popover, Tooltip } from "@wso2-enterprise/ui-toolkit";
import { MoreVertIcon } from "../../../resources";
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import SidePanelContext from "../../sidePanel/SidePanelContexProvider";
import { getSVGIcon } from "../../../resources/icons/mediatorIcons/icons";
import { getNodeDescription } from "../../../utils/node";
import { Header, Description, Name } from "../BaseNodeModel";
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
        width: ${NODE_DIMENSIONS.DEFAULT.WIDTH - (NODE_DIMENSIONS.BORDER * 2)}px;
        height: ${NODE_DIMENSIONS.DEFAULT.HEIGHT - (NODE_DIMENSIONS.BORDER * 2)}px;
        border: ${NODE_DIMENSIONS.BORDER}px solid
            ${(props: NodeStyleProp) =>
            props.hasError ? Colors.ERROR : props.selected ? Colors.SECONDARY : props.hovered ? Colors.SECONDARY : Colors.OUTLINE_VARIANT};
        border-radius: 10px;
        background-color: ${(props: NodeStyleProp) => props?.isActiveBreakpoint ? Colors.DEBUGGER_BREAKPOINT_BACKGROUND : Colors.SURFACE_BRIGHT};
        color: ${Colors.ON_SURFACE};
        cursor: pointer;
    `;

    export const Body = styled.div<{}>`
        display: flex;
        max-width: 100%;
    `;

    export const IconContainer = styled.div`
        padding: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        & img {
            height: 12px;
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
        top: ${((NODE_DIMENSIONS.DEFAULT.HEIGHT) / 2) - 12}px;
    `;

    export const TopPortWidget = styled(PortWidget)`
        margin-top: -3px;
    `;

    export const BottomPortWidget = styled(PortWidget)`
        margin-bottom: -3px;
    `;
}
interface CallNodeWidgetProps {
    node: MediatorNodeModel;
    engine: DiagramEngine;
    onClick?: (node: STNode) => void;
}

export function MediatorNodeWidget(props: CallNodeWidgetProps) {
    const { node, engine } = props;
    const [isHovered, setIsHovered] = React.useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
    const sidePanelContext = React.useContext(SidePanelContext);
    const { rpcClient } = useVisualizerContext();
    const hasDiagnotics = node.hasDiagnotics();
    const tooltip = hasDiagnotics ? node.getDiagnostics().map(diagnostic => diagnostic.message).join("\n") : undefined;
    const hasBreakpoint = node.hasBreakpoint();
    const isActiveBreakpoint = node.isActiveBreakpoint();
    const description = getNodeDescription(node.stNode);

    const handleOnClickMenu = (event: any) => {
        setIsPopoverOpen(!isPopoverOpen);
        setPopoverAnchorEl(event.currentTarget);
        event.stopPropagation();
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

    const handlePopoverClose = () => {
        setIsPopoverOpen(false);
    }

    return (
        <div >
            <Tooltip content={!isPopoverOpen ? tooltip : ""} position={'bottom'} containerPosition={'absolute'}>
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
                    <div style={{ display: "flex", flexDirection: "row", width: NODE_DIMENSIONS.DEFAULT.WIDTH }}>
                        <S.IconContainer>{getSVGIcon(node.stNode.tag)}</S.IconContainer>
                        <div>
                            {isHovered && (
                                <S.StyledButton appearance="icon" onClick={handleOnClickMenu}>
                                    <MoreVertIcon />
                                </S.StyledButton>
                            )}
                            <Header showBorder={description !== undefined}>
                                <Name>{FirstCharToUpperCase(node.stNode.tag)}</Name>
                            </Header>
                            <S.Body>
                                <Tooltip content={description} position={'bottom'} >
                                    <Description>{description}</Description>
                                </Tooltip>
                            </S.Body>
                        </div>
                    </div>
                    <S.BottomPortWidget port={node.getPort("out")!} engine={engine} />
                </S.Node>
            </Tooltip>
            <Popover
                anchorEl={popoverAnchorEl}
                open={isPopoverOpen}
                sx={{
                    backgroundColor: Colors.SURFACE,
                    marginLeft: "30px",
                    padding: 0
                }}
            >
                <ClickAwayListener onClickAway={handlePopoverClose}>
                    <Menu>
                        <MenuItem key={'delete-btn'} item={{ label: 'Delete', id: "delete", onClick: () => node.delete(rpcClient) }} />
                        {hasBreakpoint ?
                            <MenuItem key={'remove-breakpoint-btn'} item={{ label: 'Remove Breakpoint', id: "removeBreakpoint", onClick: removeBreakpoint }} /> :
                            <MenuItem key={'breakpoint-btn'} item={{ label: 'Add Breakpoint', id: "addBreakpoint", onClick: handleAddBreakpoint }} />
                        }
                    </Menu>
                </ClickAwayListener>
            </Popover>

        </div >
    );
}
