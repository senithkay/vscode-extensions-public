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
import { ConditionNodeModel } from "./ConditionNodeModel";
import { Colors } from "../../../resources/constants";
import { STNode } from "@wso2-enterprise/mi-syntax-tree/src";

namespace S {
    export const Node = styled.div<{}>`
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
    `;
}

interface CallNodeWidgetProps {
    node: ConditionNodeModel;
    engine: DiagramEngine;
    onClick?: (node: STNode) => void;
}

export function ConditionNodeWidget(props: CallNodeWidgetProps) {
    const { node, engine, onClick } = props;
    const [isHovered, setIsHovered] = React.useState(false);

    const handleOnClick = () => {
        if (onClick) {
            console.log("Condition Node clicked", node.stNode);
            onClick(node.stNode);
        }
    };

    return (
        <S.Node
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleOnClick}
        >
            <PortWidget port={node.getPort("in")!} engine={engine} />
            <svg width="56" height="56" viewBox="0 0 56 56">
                <rect
                    x="8"
                    y="8"
                    width="40"
                    height="40"
                    rx="5"
                    ry="5"
                    fill={Colors.SURFACE_BRIGHT}
                    stroke={
                        node.isSelected() ? Colors.SECONDARY : isHovered ? Colors.SECONDARY : Colors.OUTLINE_VARIANT
                    }
                    strokeWidth={2}
                    transform="rotate(45 28 28)"
                />
            </svg>
            <PortWidget port={node.getPort("out")!} engine={engine} />
        </S.Node>
    );
}
