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
import { ListenerNodeModel } from "./ListenerNodeModel";
import { Colors, NODE_BORDER_WIDTH, LISTENER_NODE_WIDTH, AUTOMATION_LISTENER } from "../../../resources/constants";
import { Button } from "@wso2-enterprise/ui-toolkit";
import { ClockIcon, ListenIcon } from "../../../resources";

export namespace NodeStyles {
    export type NodeStyleProp = {
        hovered: boolean;
        inactive?: boolean;
    };
    export const Node = styled.div<NodeStyleProp>`
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        height: ${LISTENER_NODE_WIDTH}px;
        color: ${Colors.ON_SURFACE};
        cursor: pointer;
    `;

    export const Column = styled.div<NodeStyleProp>`
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 4px;
        width: 100%;
    `;

    export const Header = styled.div`
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 6px;
        padding: 8px;
    `;

    export const Circle = styled.div<NodeStyleProp>`
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: ${LISTENER_NODE_WIDTH}px;
        height: ${LISTENER_NODE_WIDTH}px;
        border: ${NODE_BORDER_WIDTH}px solid
            ${(props: NodeStyleProp) => (props.hovered ? Colors.PRIMARY : Colors.OUTLINE_VARIANT)};
        border-radius: 50%;
        background-color: ${Colors.SURFACE_DIM};
        color: ${Colors.ON_SURFACE};
    `;

    export const StyledButton = styled(Button)`
        border-radius: 5px;
        position: absolute;
        right: 6px;
    `;

    export const MenuButton = styled(Button)`
        border-radius: 5px;
    `;

    export const LeftPortWidget = styled(PortWidget)`
        margin-top: -3px;
    `;

    export const RightPortWidget = styled(PortWidget)`
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

    export const Title = styled(StyledText)<NodeStyleProp>`
        max-width: ${LISTENER_NODE_WIDTH}px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: "GilmerMedium";
        color: ${(props: NodeStyleProp) => (props.hovered ? Colors.PRIMARY : Colors.ON_SURFACE)};
        opacity: ${(props: NodeStyleProp) => (props.inactive && !props.hovered ? 0.7 : 1)};
    `;

    export const Description = styled(StyledText)`
        font-size: 12px;
        max-width: ${LISTENER_NODE_WIDTH - 80}px;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: monospace;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        color: ${Colors.ON_SURFACE};
        opacity: 0.7;
    `;

    export const Hr = styled.hr`
        width: 100%;
    `;
}

interface ListenerNodeWidgetProps {
    model: ListenerNodeModel;
    engine: DiagramEngine;
}

export interface NodeWidgetProps extends Omit<ListenerNodeWidgetProps, "children"> {}

export function ListenerNodeWidget(props: ListenerNodeWidgetProps) {
    const { model, engine } = props;
    const [isHovered, setIsHovered] = React.useState(false);

    const handleOnClick = (event: React.MouseEvent<HTMLDivElement>) => {
        // event.stopPropagation();
    };

    const getNodeIcon = () => {
        if (model.node.type === AUTOMATION_LISTENER) {
            return <ClockIcon />;
        }
        return <ListenIcon />;
    };

    const getNodeTitle = () => {
        console.log(">>> model symbol",model.node.symbol);
        if (model.node.symbol === "ANON") {
            return "";
        }
        return model.node.symbol;
    };

    const getNodeDescription = () => {
        if (model.node.type === AUTOMATION_LISTENER) {
            return "Schedule";
        }
        return "HTTP Listener";
    };

    return (
        <NodeStyles.Node
            hovered={isHovered}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleOnClick}
        >
            <NodeStyles.Column hovered={isHovered}>
                <NodeStyles.Circle hovered={isHovered}>
                    <NodeStyles.LeftPortWidget port={model.getPort("in")!} engine={engine} />
                    <NodeStyles.Icon>{getNodeIcon()}</NodeStyles.Icon>
                    <NodeStyles.RightPortWidget port={model.getPort("out")!} engine={engine} />
                </NodeStyles.Circle>
                <NodeStyles.Header>
                    <NodeStyles.Title hovered={isHovered}>{getNodeTitle()}</NodeStyles.Title>
                    <NodeStyles.Description>{getNodeDescription()}</NodeStyles.Description>
                </NodeStyles.Header>
            </NodeStyles.Column>
        </NodeStyles.Node>
    );
}
