/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import styled from "@emotion/styled";
import { DiagramEngine, PortWidget } from "@projectstorm/react-diagrams-core";
import { CallNodeModel } from "./CallNodeModel";
import { Colors } from "../../../resources/constants";
import { STNode } from "@wso2-enterprise/mi-syntax-tree/src";
import { Button, Popover, Tooltip } from "@wso2-enterprise/ui-toolkit";
import { MoreVertIcon, PlusIcon } from "../../../resources";
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import SidePanelContext from "../../sidePanel/SidePanelContexProvider";
import { Range } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { getSVGIcon } from "../../../resources/icons/mediatorIcons/icons";

namespace S {
    export type NodeStyleProp = {
        selected: boolean;
        hovered: boolean;
        hasError: boolean;
    };
    export const Node = styled.div<NodeStyleProp>`
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        min-width: 100px;
        height: 36px;
        padding: 0 8px;
        border: 2px solid
            ${(props: NodeStyleProp) =>
            props.hasError ? Colors.ERROR : props.selected ? Colors.SECONDARY : props.hovered ? Colors.SECONDARY : Colors.OUTLINE_VARIANT};
        border-radius: 10px;
        background-color: ${Colors.SURFACE_BRIGHT};
        color: ${Colors.ON_SURFACE};
        cursor: pointer;
        font-family: var(--font-family);
        font-size: var(--type-ramp-base-font-size);
    `;

    export const Header = styled.div<{}>`
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
    `;

    export const CircleContainer = styled.div`
        position: absolute;
        top: -5px;
        left: 120px;
        color: ${Colors.ON_SURFACE};
        cursor: pointer;
        font-family: var(--font-family);
        font-size: var(--type-ramp-base-font-size);
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

    export const EndpointContainer = styled.div`
        position: absolute;
        left: 222.5px;
        top: 9px;
    `;

    export const EndpointTextWrapper = styled.div`
        position: absolute;
        left: 150px;
        top: 65px;
        width: 100px;
        text-align: center;
        color: ${Colors.ON_SURFACE};
        cursor: pointer;
        font-family: var(--font-family);
        font-size: var(--type-ramp-base-font-size);
    `;
}

interface CallNodeWidgetProps {
    node: CallNodeModel;
    engine: DiagramEngine;
    onClick?: (node: STNode) => void;
}

export function CallNodeWidget(props: CallNodeWidgetProps) {
    const { node, engine, onClick } = props;
    const [isHovered, setIsHovered] = React.useState(false);
    const visualizerContext = useVisualizerContext();
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [popoverAnchorEl, setPopoverAnchorEl] = React.useState(null);
    const sidePanelContext = React.useContext(SidePanelContext);
    const { rpcClient } = useVisualizerContext();
    const hasDiagnotics = node.hasDiagnotics();
    const tooltip = hasDiagnotics ? node.getDiagnostics().map(diagnostic => diagnostic.message).join("\n") : undefined;
    const endpointHasDiagnotics = node.endpointHasDiagnostics();
    const endpointTooltip = endpointHasDiagnotics ? node.getEndpointDiagnostics().map(diagnostic => diagnostic.message).join("\n") : undefined;

    const handleOnClickMenu = (event: any) => {
        if (onClick) {
            onClick(node.stNode);
        } else {
            setIsPopoverOpen(!isPopoverOpen);
            setPopoverAnchorEl(event.currentTarget);
            event.stopPropagation();
        }
    };

    const handleOnClick = () => {
        if (node.isSelected()) node.onClicked(visualizerContext);
    };

    const handlePlusNode = () => {
        const nodeRange: Range = {
            start: node.stNode.range.endTagRange.start,
            end: node.stNode.range.endTagRange.start,
        }

        sidePanelContext.setSidePanelState({
            ...sidePanelContext,
            isOpen: true,
            nodeRange: nodeRange,
            parentNode: node.getStNode()?.tag,
            previousNode: node.getPrevStNodes()[node.getPrevStNodes().length - 1]?.tag,
        });
    };

    const handleOnDelete = () => {
        rpcClient.getMiDiagramRpcClient().applyEdit({
            documentUri: node.documentUri,
            range: { start: node.stNode.range.startTagRange.start, end: node.stNode.range.endTagRange.end },
            text: "",
        });
    };

    const handleOnDeleteEndpoint = () => {
        rpcClient.getMiDiagramRpcClient().applyEdit({
            documentUri: node.documentUri,
            range: { start: node.endpoint.range.startTagRange.start, end: node.endpoint.range.endTagRange.end ?? node.endpoint.range.startTagRange.end },
            text: "",
        });
    };


    return (
        <div>
            <Tooltip content={tooltip} position={'bottom'} containerPosition={"absolute"} >
                <S.Node
                    selected={node.isSelected()}
                    hovered={isHovered}
                    hasError={hasDiagnotics}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={handleOnClick}
                >
                    <S.TopPortWidget port={node.getPort("in")!} engine={engine} />
                    <S.Header>
                        <S.IconContainer>
                            {getSVGIcon(node.stNode.tag)}
                        </S.IconContainer>
                        <S.NodeText>{node.stNode.tag}</S.NodeText>
                        {isHovered && (
                            <S.StyledButton appearance="icon" onClick={handleOnClickMenu}>
                                <MoreVertIcon />
                            </S.StyledButton>
                        )}
                    </S.Header>
                    <S.BottomPortWidget port={node.getPort("out")!} engine={engine} />
                </S.Node>
            </Tooltip>

            <S.CircleContainer>
                <Tooltip content={endpointTooltip} position={'bottom'} >
                    <svg width="110" height="50" viewBox="0 0 103 40">
                        <circle
                            cx="80"
                            cy="20"
                            r="22"
                            fill={Colors.SURFACE_BRIGHT}
                            stroke={endpointHasDiagnotics ? Colors.ERROR : Colors.OUTLINE_VARIANT}
                            strokeWidth={2}
                        />
                        {node.endpoint && <g transform="translate(81,20)">
                            <image x="-17" y="-15" width="30" height="30" xlinkHref={getSVGIcon(node.endpoint.type, true)} />
                        </g>}

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
                </Tooltip>
            </S.CircleContainer>

            {node.endpoint ? (
                <S.EndpointTextWrapper>{node.endpoint.type}</S.EndpointTextWrapper>
            ) : (
                <S.EndpointContainer>
                    <S.StyledButton appearance="icon" onClick={handlePlusNode}>
                        <PlusIcon />
                    </S.StyledButton>
                </S.EndpointContainer>
            )}
            <Popover
                anchorEl={popoverAnchorEl}
                open={isPopoverOpen}
                sx={{
                    backgroundColor: Colors.SURFACE,
                    marginLeft: "30px",
                }}
            >
                <Button appearance="secondary" onClick={() => {
                    handleOnDelete();
                    setIsPopoverOpen(false); // Close the popover after action
                }}>Delete</Button>
                {node.endpoint && <Button appearance="secondary" onClick={() => {
                    handleOnDeleteEndpoint();
                    setIsPopoverOpen(false); // Close the popover after action
                }}>Delete Endpoint</Button>}
            </Popover>
        </div>
    );
}
