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
import { Button } from "@wso2-enterprise/ui-toolkit";
import { CallIcon, MoreVertIcon, PlusIcon } from "../../../resources";

namespace S {
    export type NodeStyleProp = {
        selected: boolean;
        hovered: boolean;
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
                props.selected ? Colors.SECONDARY : props.hovered ? Colors.SECONDARY : Colors.OUTLINE_VARIANT};
        border-radius: 10px;
        background-color: ${Colors.SURFACE_BRIGHT};
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

    export const CircleContainer = styled.div`
        position: absolute;
        top: 0;
        right: -100px;
    `;

    export const IconContainer = styled.div`
        padding: 0 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        & svg {
            height: 16px;
            width: 16px;
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
}

interface CallNodeWidgetProps {
    node: CallNodeModel;
    engine: DiagramEngine;
    onClick?: (node: STNode) => void;
}

export function CallNodeWidget(props: CallNodeWidgetProps) {
    const { node, engine, onClick } = props;
    const [isHovered, setIsHovered] = React.useState(false);

    const handleOnClick = () => {
        if (onClick) {
            onClick(node.stNode);
            console.log("Mediator Node clicked", node.stNode);
        }
    };

    return (
        <S.Node
            selected={node.isSelected()}
            hovered={isHovered}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleOnClick}
        >
            <S.TopPortWidget port={node.getPort("in")!} engine={engine} />
            <S.Header>
                <S.IconContainer>
                    <CallIcon />
                </S.IconContainer>
                <S.NodeText>{node.stNode.tag} lkasdjf aljfdlka akjsd</S.NodeText>
                {isHovered && (
                    <S.StyledButton appearance="icon" onClick={handleOnClick}>
                        {node.endpoint ? <MoreVertIcon /> : <PlusIcon />}
                    </S.StyledButton>
                )}
            </S.Header>
            <S.BottomPortWidget port={node.getPort("out")!} engine={engine} />
            {node.endpoint && (
                <S.CircleContainer>
                    <svg width="100" height="40" viewBox="0 0 100 40">
                        <circle
                            cx="80"
                            cy="20"
                            r="18"
                            fill={Colors.SURFACE_BRIGHT}
                            stroke={Colors.OUTLINE_VARIANT}
                            strokeWidth={2}
                        />
                        <g id="node" transform="translate(100, 100)">
                            <rect width="50" height="50" style={{ fill: "blue" }} />
                        </g>
                        <line
                            x1="0"
                            y1="20"
                            x2="60"
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
            )}
        </S.Node>
    );
}
