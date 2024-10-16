/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { ApiIcon, FitScreenIcon, MinusIcon, PlusIcon } from "../../resources";
import styled from "@emotion/styled";
import { Colors, NodeTypes } from "../../resources/constants";
import { DiagramEngine } from "@projectstorm/react-diagrams-core";

export namespace ControlsStyles {
    export const Container = styled.div`
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 8px;

        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: 1000;
    `;

    export const GroupContainer = styled.div`
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 0;

        & > *:not(:last-child) {
            border-bottom: 1px solid ${Colors.OUTLINE_VARIANT};
        }

        & > *:first-child {
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
        }

        & > *:last-child {
            border-top-left-radius: 0;
            border-top-right-radius: 0;
        }

        & > *:not(:first-child):not(:last-child) {
            border-radius: 0;
        }
    `;

    export const Button = styled.div`
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 8px;
        border-radius: 4px;
        background-color: ${Colors.SURFACE};
        fill: ${Colors.ON_SURFACE};
        width: 32px;
        height: 32px;
        cursor: pointer;

        &:hover {
            background-color: ${Colors.SURFACE_CONTAINER};
        }

        &:active {
            background-color: ${Colors.SURFACE_CONTAINER};
        }
    `;
}

interface ControlsProps {
    engine: DiagramEngine;
}

export function Controls(props: ControlsProps) {
    const { engine } = props;

    const handleZoomToFit = () => {
        console.log(">>> zoom to start node");
        // zoom to start node
        const nodes = engine.getModel().getNodes();
        if (!nodes || nodes.length === 0) {
            return;
        }

        const startNode = nodes.find((node) => node.getType() === NodeTypes.START_NODE);
        if (startNode) {
            startNode.setSelected(true);
            engine.zoomToFitSelectedNodes({ margin: 0, maxZoom: 1 });
            startNode.setSelected(false);
        } else {
            engine.zoomToFitNodes({ margin: 0, maxZoom: 1 });
        }
    };

    const onZoom = (zoomIn: boolean) => {
        const delta: number = zoomIn ? +5 : -5;
        engine.getModel().setZoomLevel(engine.getModel().getZoomLevel() + delta);
        engine.repaintCanvas();
    };

    return (
        <ControlsStyles.Container>
            <ControlsStyles.Button onClick={handleZoomToFit}>
                <FitScreenIcon />
            </ControlsStyles.Button>
            <ControlsStyles.GroupContainer>
                <ControlsStyles.Button onClick={() => onZoom(true)}>
                    <PlusIcon />
                </ControlsStyles.Button>
                <ControlsStyles.Button onClick={() => onZoom(false)}>
                    <MinusIcon />
                </ControlsStyles.Button>
            </ControlsStyles.GroupContainer>
        </ControlsStyles.Container>
    );
}

export default Controls;
