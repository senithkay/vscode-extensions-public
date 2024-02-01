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
import { CallIcon } from "../../../resources";

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

    export const TopPortWidget = styled(PortWidget)`
        margin-top: -3px;
    `;

    export const BottomPortWidget = styled(PortWidget)`
        margin-bottom: -3px;
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
                <div>{node.stNode.tag}</div>
                
            </S.Header>
            <S.BottomPortWidget port={node.getPort("out")!} engine={engine} />
            <S.CircleContainer>
                    <svg width="40" height="40" viewBox="0 0 40 40">
                        <circle
                            cx="20"
                            cy="20"
                            r="18"
                            fill={Colors.SURFACE_BRIGHT}
                            stroke={Colors.OUTLINE_VARIANT}
                            strokeWidth={2}
                        />
                    </svg>
                </S.CircleContainer>
        </S.Node>
    );
}
