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

    export const ActionContainer = styled.div<NodeStyleProp>`
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        > svg {
            margin-bottom: -12px;
            margin-top: -12px;
            cursor: pointer;
            visibility: ${(props: NodeStyleProp) => (props.hovered || props.selected ? "visible" : "hidden")};
        }
    `;
}

interface CallNodeWidgetProps {
    node: MediatorNodeModel;
    engine: DiagramEngine;
    addNode?: () => void;
}

export function MediatorNodeWidget(props: CallNodeWidgetProps) {
    const { node, engine, addNode } = props;
    const [isHovered, setIsHovered] = React.useState(false);

    const handleAddNode = () => {
        if (addNode) {
            addNode();
        }
    };

    return (
        <S.Node
            selected={node.isSelected()}
            hovered={isHovered}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <S.TopPortWidget port={node.getPort("in")!} engine={engine} />
            <S.Header>
                <div>{/* icon here */}</div>
                <div>{node.stNode.tag}</div>
                <S.BottomPortWidget port={node.getPort("right")!} engine={engine} />
            </S.Header>
            <S.ActionContainer hovered={isHovered} selected={node.isSelected()}>
                <svg width="24" height="24" viewBox="0 0 1024 1024" onClick={handleAddNode}>
                    <rect width="1024" height="1024" fill={Colors.SURFACE_BRIGHT} />
                    <path
                        fill={Colors.SECONDARY}
                        d="M696 480H544V328c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v152H328c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h152v152c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V544h152c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8"
                    />
                    <path
                        fill={Colors.SECONDARY}
                        d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448s448-200.6 448-448S759.4 64 512 64m0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372s372 166.6 372 372s-166.6 372-372 372"
                    />
                </svg>
                <S.BottomPortWidget port={node.getPort("out")!} engine={engine} />
            </S.ActionContainer>
        </S.Node>
    );
}
