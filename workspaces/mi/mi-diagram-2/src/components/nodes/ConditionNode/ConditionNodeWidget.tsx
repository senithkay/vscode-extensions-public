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
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { Tooltip } from "@wso2-enterprise/ui-toolkit";

namespace S {
    export const Node = styled.div<{}>`
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        background-color: ${Colors.SURFACE_BRIGHT};
        color: ${Colors.ON_SURFACE};
        & svg {
            fill: ${Colors.ON_SURFACE};
        }
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
    const visualizerContext = useVisualizerContext();
    const hasDiagnotics = node.hasDiagnotics();
    const tooltip = hasDiagnotics ? node.getDiagnostics().map(diagnostic => diagnostic.message).join("\n") : undefined;

    const handleOnClickMenu = () => {
        if (onClick) {
            console.log("Condition Node clicked", node.stNode);
            onClick(node.stNode);
        }
    };

    const handleOnClick = () => {
        if (node.isSelected()) node.onClicked(visualizerContext);
    };

    return (
        <Tooltip content={tooltip} position={'bottom'} containerPosition={'absolute'}>
            <S.Node
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={handleOnClick}
            >
                <PortWidget port={node.getPort("in")!} engine={engine} />
                <svg width="65" height="65" viewBox="0 0 70 70">
                    <rect
                        x="12"
                        y="2"
                        width="50"
                        height="50"
                        rx="5"
                        ry="5"
                        fill={Colors.SURFACE_BRIGHT}
                        stroke={
                            node.hasDiagnotics() ? Colors.ERROR : node.isSelected() ? Colors.SECONDARY : isHovered ? Colors.SECONDARY : Colors.OUTLINE_VARIANT
                        }
                        strokeWidth={2}
                        transform="rotate(45 28 28)"
                    />
                    <svg x="20" y="30" width="30" height="30" viewBox="0 0 24 24">
                        <path
                            fill={Colors.ON_SURFACE}
                            transform="rotate(180)"
                            transform-origin="50% 50%"
                            d="m14.85 4.85l1.44 1.44l-2.88 2.88l1.42 1.42l2.88-2.88l1.44 1.44a.5.5 0 0 0 .85-.36V4.5c0-.28-.22-.5-.5-.5h-4.29a.5.5 0 0 0-.36.85M8.79 4H4.5c-.28 0-.5.22-.5.5v4.29c0 .45.54.67.85.35L6.29 7.7L11 12.4V19c0 .55.45 1 1 1s1-.45 1-1v-7c0-.26-.11-.52-.29-.71l-5-5.01l1.44-1.44c.31-.3.09-.84-.36-.84"
                        />
                    </svg>
                    <text x="20" y="30">{node.getStNode().tag}</text>
                </svg>
                <PortWidget port={node.getPort("out")!} engine={engine} />
            </S.Node>
        </Tooltip>
    );
}
