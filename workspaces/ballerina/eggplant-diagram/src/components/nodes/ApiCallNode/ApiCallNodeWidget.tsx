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
import { ApiCallNodeModel } from "./ApiCallNodeModel";
import {
    Colors,
    NODE_BORDER_WIDTH,
    NODE_GAP_X,
    NODE_HEIGHT,
    NODE_PADDING,
    NODE_WIDTH,
} from "../../../resources/constants";
import { Button } from "@wso2-enterprise/ui-toolkit";
import { MoreVertIcon } from "../../../resources";
import { FlowNode } from "../../../utils/types";
import NodeIcon from "../../NodeIcon";
import ConnectorIcon from "../../ConnectorIcon";
import { useDiagramContext } from "../../DiagramContext";

export namespace NodeStyles {
    export const Node = styled.div`
        display: flex;
        flex-direction: row;
        /* justify-content: space-between; */
        align-items: center;
    `;

    export type NodeStyleProp = {
        selected: boolean;
        hovered: boolean;
    };
    export const Box = styled.div<NodeStyleProp>`
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        width: ${NODE_WIDTH}px;
        min-height: ${NODE_HEIGHT}px;
        padding: 0 ${NODE_PADDING}px;
        border: ${NODE_BORDER_WIDTH}px solid
            ${(props: NodeStyleProp) =>
                props.selected ? Colors.PRIMARY : props.hovered ? Colors.PRIMARY : Colors.OUTLINE_VARIANT};
        border-radius: 10px;
        background-color: ${Colors.SURFACE_DIM};
        color: ${Colors.ON_SURFACE};
        /* cursor: pointer; */
    `;

    export const Header = styled.div<{}>`
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: 2px;
        width: 100%;
        padding: 8px;
    `;

    export const StyledButton = styled(Button)`
        border-radius: 5px;
        position: absolute;
        right: 116px;
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
        max-width: ${NODE_WIDTH - 80}px;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: monospace;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        color: ${Colors.ON_SURFACE};
        opacity: 0.7;
    `;

    export const Row = styled.div`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    `;

    export const Hr = styled.hr`
        width: 100%;
    `;
}

interface ApiCallNodeWidgetProps {
    model: ApiCallNodeModel;
    engine: DiagramEngine;
    onClick?: (node: FlowNode) => void;
}

export interface NodeWidgetProps extends Omit<ApiCallNodeWidgetProps, "children"> {}

export function ApiCallNodeWidget(props: ApiCallNodeWidgetProps) {
    const { model, engine, onClick } = props;
    const [isHovered, setIsHovered] = React.useState(false);
    const { onNodeSelect } = useDiagramContext();

    const handleOnClick = () => {
        onClick && onClick(model.node);
        onNodeSelect(model.node);
    };

    return (
        <NodeStyles.Node onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onClick={handleOnClick}>
            <NodeStyles.Box selected={model.isSelected()} hovered={isHovered}>
                <NodeStyles.TopPortWidget port={model.getPort("in")!} engine={engine} />
                <NodeStyles.Row>
                    <NodeStyles.Icon>
                        <NodeIcon type={model.node.codedata.node} />
                    </NodeStyles.Icon>
                    <NodeStyles.Header>
                        <NodeStyles.Title>{model.node.codedata.module} : {model.node.metadata.label}</NodeStyles.Title>
                        <NodeStyles.Description>{model.node.metadata.description}</NodeStyles.Description>
                    </NodeStyles.Header>
                    <NodeStyles.StyledButton appearance="icon" onClick={handleOnClick}>
                        <MoreVertIcon />
                    </NodeStyles.StyledButton>
                </NodeStyles.Row>
                <NodeStyles.BottomPortWidget port={model.getPort("out")!} engine={engine} />
            </NodeStyles.Box>

            <svg width={NODE_GAP_X + NODE_HEIGHT} height={NODE_HEIGHT} viewBox="0 0 103 40">
                <circle
                    cx="80"
                    cy="20"
                    r="22"
                    fill={Colors.SURFACE_DIM}
                    stroke={model.isSelected() ? Colors.PRIMARY : isHovered ? Colors.PRIMARY : Colors.OUTLINE_VARIANT}
                    strokeWidth={1.5}
                />
                <foreignObject x="68" y="8" width="44" height="44" fill={Colors.ON_SURFACE}>
                    <ConnectorIcon node={model.node} />
                </foreignObject>
                <line
                    x1="0"
                    y1="20"
                    x2="57"
                    y2="20"
                    style={{
                        stroke: model.isSelected() ? Colors.PRIMARY : isHovered ? Colors.PRIMARY : Colors.ON_SURFACE,
                        strokeWidth: 1.5,
                        markerEnd: `url(#${model.node.id}-arrow-head)`,
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
                        id={`${model.node.id}-arrow-head`}
                    >
                        <polygon
                            points="0,4 0,0 4,2"
                            fill={model.isSelected() ? Colors.PRIMARY : isHovered ? Colors.PRIMARY : Colors.ON_SURFACE}
                        ></polygon>
                    </marker>
                </defs>
            </svg>
        </NodeStyles.Node>
    );
}
