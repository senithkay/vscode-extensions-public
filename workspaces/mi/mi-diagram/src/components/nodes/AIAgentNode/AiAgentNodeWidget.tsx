/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useMemo, useState } from "react";
import styled from "@emotion/styled";
import { DiagramEngine, PortWidget } from "@projectstorm/react-diagrams-core";
import { AiAgentNodeModel } from "./AiAgentNodeModel";
import { Colors, NODE_DIMENSIONS, NODE_GAP } from "../../../resources/constants";
import { Connector, STNode } from "@wso2-enterprise/mi-syntax-tree/src";
import { ClickAwayListener, Menu, MenuItem, Popover, Tooltip, Typography } from "@wso2-enterprise/ui-toolkit";
import { MoreVertIcon } from "../../../resources";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import SidePanelContext from "../../sidePanel/SidePanelContexProvider";
import { BreakpointMenu } from "../../BreakpointMenu/BreakpointMenu";
import { Body, Description, Header, Name, OptionsMenu } from "../BaseNodeModel";
import path from "path";
import { FirstCharToUpperCase } from "../../../utils/commons";
import { handleOnConnectionClick } from "../CommonUtils";
import { getTextSizes } from "../../../utils/node";

namespace S {
    export type NodeStyleProp = {
        height: number;
        width: number;
        left: number;
        right: number;
        selected: boolean;
        hovered: boolean;
        hasError: boolean;
        isActiveBreakpoint?: boolean;
    };
    export const Node = styled.div<NodeStyleProp>`
        height: ${(props: ContainerStyleProp) => props.height - (NODE_DIMENSIONS.BORDER * 2)}px;
        width: ${(props: ContainerStyleProp) => props.width}px;
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

    export const DefaultContent = styled.div`
        display: flex;
        justify-content: center;
        flex-direction: row;
        margin-top: 20px;
    `;

    export const PromptBox = styled.div`
        margin: 0 10px;
        padding: 10px;
        border-radius: 4px;
        background-color: ${Colors.SURFACE_CONTAINER};
    `;

    export const Header = styled.div<{}>`
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
    `;

    export const IconContainer = styled.div`
        padding: 8px 0;
        & img {
            height: 25px;
            width: 25px;
            fill: ${Colors.ON_SURFACE};
            stroke: ${Colors.ON_SURFACE};
        }
    `;

    export const EOptionsMenu = styled(OptionsMenu)`
        top: 40px;   
    `;

    export const TopPortWidget = styled(PortWidget)`
        margin-top: -3px;
        margin-left: -2px;
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
        left: number;
        right: number;
    };

    export const TooltipContent = styled.div`
        max-width: 80vw;
        white-space: pre-wrap;
    `;

    export const CircleContainer = styled.div`
        position: absolute;
        top: 5px;
        left: ${NODE_DIMENSIONS.AI_AGENT.WIDTH}px;
        color: ${Colors.ON_SURFACE};
        cursor: pointer;
        font-family: var(--font-family);
        font-size: var(--type-ramp-base-font-size);
    `;

    export const ConnectionText = styled.div`
        width: 170px;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    `;
}

interface CallNodeWidgetProps {
    node: AiAgentNodeModel;
    engine: DiagramEngine;
    onClick?: (node: STNode) => void;
}

export function AiAgentNodeWidget(props: CallNodeWidgetProps) {
    const { node, engine } = props;
    const [isHovered, setIsHovered] = React.useState(false);
    const [isSelected, setIsSelected] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const [isHoveredConfigCircle, setIsHoveredConfigCircle] = React.useState(false);
    const [isHoveredMemoryConfigCircle, setIsHoveredMemoryConfigCircle] = React.useState(false);


    const [iconPath, setIconPath] = useState(null);
    const [connectionIconPath, setConnectionIconPath] = useState(null);

    const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
    const sidePanelContext = React.useContext(SidePanelContext);
    const { rpcClient, setIsLoading: setDiagramLoading } = useVisualizerContext();
    const hasDiagnotics = node.hasDiagnotics();
    const hasBreakpoint = node.hasBreakpoint();
    const isActiveBreakpoint = node.isActiveBreakpoint();
    const stNode = node.getStNode() as Connector;
    const connectorName = stNode.connectorName;
    const methodName = stNode.method;
    const systemPrompt = stNode.parameters?.filter((property: any) => property.name === "system")[0]?.value;
    const prompt = stNode.parameters?.filter((property: any) => property.name === "prompt")[0]?.value;
    const systemPromptSize = getTextSizes(systemPrompt, "13px", undefined, undefined, 160);
    const promptSize = getTextSizes(prompt, "13px", undefined, undefined, 160);
    const systemPromptHeight = systemPrompt ? 36 + systemPromptSize.height : 0;
    const promptHeight = prompt ? 36 + promptSize.height : 0;

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

    useEffect(() => {
        setIsSelected(sidePanelContext?.node === node);
    }, [sidePanelContext?.node]);

    useEffect(() => {
        node.setSelected(sidePanelContext?.node === node);

        const fetchData = async () => {
            const connectorData = await rpcClient.getMiDiagramRpcClient().getAvailableConnectors({
                documentUri: node.documentUri,
                connectorName: stNode.tag.split(".")[0]
            });
            const connectionData: any = await rpcClient.getMiDiagramRpcClient().getConnectorConnections({
                documentUri: node.documentUri,
                connectorName: stNode.tag.split(".")[0]
            });
            const connectionName = stNode.configKey;
            const connection = connectionData.connections.find((connection: any) => connection.name === connectionName);
            const connectionType = connection ? connection.connectionType : null;

            const connectionIconPath = await rpcClient.getMiDiagramRpcClient().getIconPathUri({
                path: path.join(connectorData.iconPath, 'connections'),
                name: connectionType
            });
            const iconPath = await rpcClient.getMiDiagramRpcClient().getIconPathUri({ path: connectorData.iconPath, name: "icon-small" });
            setIconPath(iconPath?.uri);
            setConnectionIconPath(connectionIconPath?.uri ?? iconPath?.uri);
        }
        fetchData();
    }, [sidePanelContext?.node]);

    const handleOnClick = async (e: any) => {
        e.stopPropagation();
        const nodeRange = { start: stNode.range.startTagRange.start, end: stNode?.range?.endTagRange?.end || stNode.range.startTagRange.end };
        if (e.ctrlKey || e.metaKey) {
            // open code and highlight the selected node
            rpcClient.getMiDiagramRpcClient().highlightCode({
                range: nodeRange,
                force: true,
            });
        } else if (node.isSelected()) {
            const connectorData = await rpcClient.getMiDiagramRpcClient().getAvailableConnectors({
                documentUri: node.documentUri,
                connectorName: stNode.tag.split(".")[0]
            });

            const operationName = stNode.tag.split(/\.(.+)/)[1];
            const connectorDetails = await rpcClient.getMiDiagramRpcClient().getMediator({
                range: nodeRange,
                documentUri: node.documentUri,
                isEdit: true
            });

            const formJSON = connectorDetails;

            sidePanelContext.setSidePanelState({
                isOpen: true,
                operationName: "connector",
                nodeRange: nodeRange,
                isEditing: true,
                formValues: {
                    form: formJSON,
                    title: `${FirstCharToUpperCase(operationName)} Operation`,
                    uiSchemaPath: connectorData.uiSchemaPath,
                    parameters: stNode.parameters ?? [],
                    connectorName: connectorData.name,
                    operationName: operationName,
                    connectionName: stNode.configKey,
                    icon: iconPath,
                },
                parentNode: node.mediatorName,
                node: node,
                tag: stNode.tag
            });
        }
    }

    const TooltipEl = useMemo(() => {
        return () => (
            <S.TooltipContent style={{ textWrap: "wrap" }}>
                {tooltip}
            </S.TooltipContent>
        );
    }, [tooltip])


    const ConnectionCircle = () => {
        return <S.CircleContainer
        >
            <svg width="110" height="50" viewBox="0 0 103 40"
                onClick={(e) => handleOnConnectionClick(e, node, stNode, rpcClient)}
            >
                <g onMouseEnter={() => setIsHoveredConfigCircle(true)} onMouseLeave={() => setIsHoveredConfigCircle(false)}>
                    <circle
                        cx="80"
                        cy="20"
                        r="22"
                        fill={Colors.SURFACE_BRIGHT}
                        strokeWidth={2}
                        style={{ stroke: isHoveredConfigCircle ? Colors.SECONDARY : Colors.OUTLINE_VARIANT }}
                    />

                    {connectionIconPath && <g transform="translate(68,7)">
                        <foreignObject width="25" height="25">
                            <img src={connectionIconPath} alt="Icon" />
                        </foreignObject>
                    </g>}
                </g>

                <line
                    x1="0"
                    y1="20"
                    x2="57"
                    y2="20"
                    style={{
                        stroke: Colors.PRIMARY,
                        strokeWidth: 2,
                        markerEnd: `url(#${node.getID()}-arrow-head)`,
                    }}
                />
                <defs>
                    <marker
                        markerWidth="4"
                        markerHeight="4"
                        refX="3"
                        refY="2"
                        viewBox="0 0 4 4"
                        orient="auto"
                        id={`${node.getID()}-arrow-head`}
                    >
                        <polygon points="0,4 0,0 4,2" fill={Colors.PRIMARY}></polygon>
                    </marker>
                </defs>
            </svg>
            {stNode.configKey &&
                <S.ConnectionText>
                    {stNode.configKey}
                </S.ConnectionText>}
        </S.CircleContainer>
    }

    const MemoryConnectionCircle = () => {
        return <S.CircleContainer style={{ marginTop: "80px" }}>
            <svg width="110" height="50" viewBox="0 0 103 40">
                <g onMouseEnter={() => setIsHoveredMemoryConfigCircle(true)} onMouseLeave={() => setIsHoveredMemoryConfigCircle(false)}>
                    <circle
                        cx="80"
                        cy="20"
                        r="22"
                        fill={Colors.SURFACE_BRIGHT}
                        strokeWidth={2}
                        style={{ stroke: isHoveredMemoryConfigCircle ? Colors.SECONDARY : Colors.OUTLINE_VARIANT }}
                    />

                    {connectionIconPath && <g transform="translate(68,7)">
                        <foreignObject width="25" height="25">
                            <img src={connectionIconPath} alt="Icon" />
                        </foreignObject>
                    </g>}
                </g>

                <line
                    x1="0"
                    y1="20"
                    x2="57"
                    y2="20"
                    style={{
                        stroke: Colors.PRIMARY,
                        strokeWidth: 2,
                        markerEnd: `url(#${node.getID()}-arrow-head)`,
                    }}
                />
                <defs>
                    <marker
                        markerWidth="4"
                        markerHeight="4"
                        refX="3"
                        refY="2"
                        viewBox="0 0 4 4"
                        orient="auto"
                        id={`${node.getID()}-arrow-head`}
                    >
                        <polygon points="0,4 0,0 4,2" fill={Colors.PRIMARY}></polygon>
                    </marker>
                </defs>
            </svg>
        </S.CircleContainer>
    }

    return (
        <div data-testid={`aiAgentNode-${node.getID()}`}>
            <Tooltip content={!isPopoverOpen && tooltip ? <TooltipEl /> : ""} position={"bottom"} containerPosition={"absolute"}>
                <S.Node
                    width={stNode.viewState.fw} height={stNode.viewState.fh} left={stNode.viewState.l} right={stNode.viewState.r}
                    selected={isSelected}
                    hasError={hasDiagnotics}
                    hovered={isHovered || isActiveBreakpoint}
                    isActiveBreakpoint={isActiveBreakpoint}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={(e) => handleOnClick(e)}
                >
                    {hasBreakpoint && (
                        <div style={{ position: "absolute", left: -5, width: 15, height: 15, borderRadius: "50%", backgroundColor: "red" }}></div>
                    )}
                    <S.TopPortWidget port={node.getPort("in")!} engine={engine} />
                    <S.DefaultContent>
                        <S.IconContainer>
                            {iconPath && <img src={iconPath} alt="Icon" />}
                        </S.IconContainer>
                        <div>

                            <Header showBorder={true}>
                                <Name>{FirstCharToUpperCase(methodName)}</Name>
                            </Header>
                            <Body>
                                <Description>{FirstCharToUpperCase(connectorName)}</Description>
                            </Body>
                        </div>
                        {isHovered && (
                            <S.EOptionsMenu appearance="icon" onClick={handleOnClickMenu}>
                                <MoreVertIcon />
                            </S.EOptionsMenu>
                        )}
                    </S.DefaultContent>

                    {systemPrompt && <S.PromptBox>
                        <Header showBorder={true}>
                            <Typography variant="h5" sx={{ margin: 0 }}>System Prompt</Typography>
                        </Header>

                        <Tooltip
                            content={systemPromptSize.lineCount > 8 ? systemPrompt : undefined}
                            sx={{
                                maxWidth: "50%",
                                textWrap: "wrap"
                            }}
                            position={'bottom'} >
                            <Typography variant="body3" sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: '8',
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}>{systemPrompt}</Typography>
                        </Tooltip>
                    </S.PromptBox>}

                    {prompt && <S.PromptBox style={{ marginTop: "5px" }}>
                        <Header showBorder={true}>
                            <Typography variant="h5" sx={{ margin: 0 }}>User Prompt</Typography>
                        </Header>
                        <Tooltip
                            content={promptSize.lineCount > 8 ? prompt : undefined}
                            sx={{
                                maxWidth: "50%",
                                textWrap: "wrap"
                            }}
                            position={'bottom'} >
                            <Typography variant="body3" sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: '8',
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}>{prompt}</Typography>
                        </Tooltip>
                    </S.PromptBox>}

                    {stNode.tools && <div style={{ width: "90%", height: "0.2px", margin: "10px auto", backgroundColor: Colors.OUTLINE_VARIANT }} />}

                    <S.BottomPortWidget style={{ position: "absolute", bottom: "3px", left: "calc(50% - 1px)" }} port={node.getPort("out")!} engine={engine} />
                </S.Node>
            </Tooltip>

            <>
                {stNode.tools && <Typography variant="h4" sx={{
                    marginTop: NODE_GAP.AI_AGENT_TOP + systemPromptHeight + 5 + promptHeight + 10,
                    width: NODE_DIMENSIONS.AI_AGENT.WIDTH,
                    textAlign: "center",
                    position: 'absolute'
                }}>
                    Tools
                </Typography>}
                {stNode.configKey &&
                    MemoryConnectionCircle()
                }
                {stNode.configKey &&
                    ConnectionCircle()
                }
            </>

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
                            item={{ label: "Delete", id: "delete", onClick: () => node.delete(rpcClient, setDiagramLoading) }}
                        />
                        <BreakpointMenu hasBreakpoint={hasBreakpoint} node={node} rpcClient={rpcClient} />
                    </Menu>
                </ClickAwayListener>
            </Popover>
        </div>
    );
}
