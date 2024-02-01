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
import { MediatorNodeModel } from "./MediatorNodeModel";
import { Colors } from "../../../resources/constants";
import { STNode } from "@wso2-enterprise/mi-syntax-tree/src";

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
        height: 50px;
        padding: 0 8px;
        border: 2px solid
            ${(props: NodeStyleProp) =>
                props.selected ? Colors.SECONDARY : props.hovered ? Colors.SECONDARY : Colors.OUTLINE_VARIANT};
        border-radius: 10px;
        background-color: ${Colors.SURFACE_BRIGHT};
        color: ${Colors.ON_SURFACE};
    `;

    export const Header = styled.div<{}>`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
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
                <div>{/* icon here */}</div>
                <div>{node.stNode.tag}</div>
                <S.BottomPortWidget port={node.getPort("right")!} engine={engine} />
            </S.Header>
            <S.BottomPortWidget port={node.getPort("out")!} engine={engine} />
        </S.Node>
    );
}
