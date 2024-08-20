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
import { DraftNodeModel } from "./DraftNodeModel";
import {
    Colors,
    DRAFT_NODE_BORDER_WIDTH,
    DRAFT_NODE_HEIGHT,
    DRAFT_NODE_WIDTH,
    NODE_PADDING,
} from "../../../resources/constants";
import { FlowNode } from "../../../utils/types";
import { useDiagramContext } from "../../DiagramContext";

export namespace NodeStyles {
    export const Node = styled.div`
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        width: ${DRAFT_NODE_WIDTH}px;
        min-height: ${DRAFT_NODE_HEIGHT}px;
        padding: 0 ${NODE_PADDING}px;
        border: ${DRAFT_NODE_BORDER_WIDTH}px dashed ${Colors.PRIMARY};
        border-radius: 10px;
        background-color: ${Colors.PRIMARY_CONTAINER};
        color: ${Colors.ON_SURFACE};
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

    export const Row = styled.div`
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        width: 100%;
    `;

    export const Description = styled(StyledText)`
        font-size: 12px;
        max-width: ${DRAFT_NODE_WIDTH - 80}px;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: monospace;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        color: ${Colors.ON_SURFACE};
        opacity: 0.7;
    `;
}

interface DraftNodeWidgetProps {
    model: DraftNodeModel;
    engine: DiagramEngine;
    onClick?: (node: FlowNode) => void;
}

export interface NodeWidgetProps extends Omit<DraftNodeWidgetProps, "children"> {}

export function DraftNodeWidget(props: DraftNodeWidgetProps) {
    const { model, engine, onClick } = props;
    const [isHovered, setIsHovered] = React.useState(false);
    const { onNodeSelect, goToSource } = useDiagramContext();

    const handleOnClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.metaKey) {
            // Handle action when cmd key is pressed
            goToSource && goToSource(model.node);
        } else {
            onClick && onClick(model.node);
            onNodeSelect && onNodeSelect(model.node);
        }
    };

    return (
        <NodeStyles.Node>
            <NodeStyles.TopPortWidget port={model.getPort("in")!} engine={engine} />
            <NodeStyles.Row>
                <NodeStyles.Description>Node will be added here.</NodeStyles.Description>
            </NodeStyles.Row>
            <NodeStyles.BottomPortWidget port={model.getPort("out")!} engine={engine} />
        </NodeStyles.Node>
    );
}
