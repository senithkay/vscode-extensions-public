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
import { IfNodeModel } from "./IfNodeModel";
import { Colors, NODE_HEIGHT, NODE_WIDTH } from "../../../resources/constants";
import { Button } from "@wso2-enterprise/ui-toolkit";
import { CodeIcon, MoreVertIcon } from "../../../resources";
import { Node } from "../../../utils/types";
import NodeIcon from "../../NodeIcon";

export namespace NodeStyles {
    export type NodeStyleProp = {
        selected: boolean;
        hovered: boolean;
    };
    export const Node = styled.div<NodeStyleProp>`
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        min-width: ${NODE_WIDTH}px;
        min-height: ${NODE_HEIGHT}px;
        padding: 0 8px;
        /* border: 1.5px solid
            ${(props: NodeStyleProp) =>
            props.selected ? Colors.PRIMARY : props.hovered ? Colors.PRIMARY : Colors.OUTLINE_VARIANT}; */
        /* border-radius: 10px; */
        /* background-color: ${Colors.SURFACE_DIM}; */
        color: ${Colors.ON_SURFACE};
        /* cursor: pointer; */
    `;

    export const Header = styled.div<{}>`
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        width: 100%;
        padding: 8px;
    `;

    export const StyledButton = styled(Button)`
        border-radius: 5px;
        position: absolute;
        right: 6px;
    `;

    export const TopPortWidget = styled(PortWidget)`
        margin-top: -3px;
    `;

    export const BottomPortWidget = styled(PortWidget)`
        margin-bottom: -2px;
    `;

    export const StyledText = styled.div`
        font-size: 14px;
    `;

    export const Icon = styled.div`
        padding: 4px;
        svg {
            fill: ${Colors.ON_SURFACE};
        }
    `;

    export const Title = styled(StyledText)`
        max-width: ${NODE_WIDTH - 50}px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: "GilmerMedium";
    `;

    export const Description = styled(StyledText)`
        font-size: 12px;
        max-width: ${NODE_WIDTH - 50}px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: monospace;
    `;

    export const Row = styled.div`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    `;

    export const Column = styled.div`
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
    `;

    export const Hr = styled.hr`
        width: 100%;
    `;
}

interface IfNodeWidgetProps {
    model: IfNodeModel;
    engine: DiagramEngine;
    onClick?: (node: Node) => void;
}

export interface NodeWidgetProps extends Omit<IfNodeWidgetProps, "children"> {}

export function IfNodeWidget(props: IfNodeWidgetProps) {
    const { model, engine, onClick } = props;
    const [isHovered, setIsHovered] = React.useState(false);

    const handleOnClick = () => {
        onClick && onClick(model.node);
    };

    return (
        <NodeStyles.Node
            selected={model.isSelected()}
            hovered={isHovered}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <NodeStyles.Row>
                <NodeStyles.Column>
                    <NodeStyles.TopPortWidget port={model.getPort("in")!} engine={engine} />
                    <svg width="65" height="65" viewBox="0 0 70 70">
                        <rect
                            x="12"
                            y="2"
                            width="50"
                            height="50"
                            rx="5"
                            ry="5"
                            fill={Colors.SURFACE_BRIGHT}
                            stroke={Colors.OUTLINE_VARIANT}
                            strokeWidth={2}
                            transform="rotate(45 28 28)"
                        />
                        <svg x="20" y="15" width="30" height="30" viewBox="0 0 24 24">
                            <path
                                fill={Colors.ON_SURFACE}
                                transform="rotate(180)"
                                transform-origin="50% 50%"
                                d="m14.85 4.85l1.44 1.44l-2.88 2.88l1.42 1.42l2.88-2.88l1.44 1.44a.5.5 0 0 0 .85-.36V4.5c0-.28-.22-.5-.5-.5h-4.29a.5.5 0 0 0-.36.85M8.79 4H4.5c-.28 0-.5.22-.5.5v4.29c0 .45.54.67.85.35L6.29 7.7L11 12.4V19c0 .55.45 1 1 1s1-.45 1-1v-7c0-.26-.11-.52-.29-.71l-5-5.01l1.44-1.44c.31-.3.09-.84-.36-.84"
                            />
                        </svg>
                    </svg>
                    <NodeStyles.BottomPortWidget port={model.getPort("out")!} engine={engine} />
                </NodeStyles.Column>
                <NodeStyles.Header>
                    <NodeStyles.Title>{model.node.label || model.node.kind}</NodeStyles.Title>
                    <NodeStyles.Description>
                        Lorem ipsum dolor sit amet
                    </NodeStyles.Description>
                </NodeStyles.Header>
            </NodeStyles.Row>
        </NodeStyles.Node>
    );
}
