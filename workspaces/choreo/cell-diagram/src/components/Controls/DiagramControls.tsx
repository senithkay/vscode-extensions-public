/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext } from "react";
import styled from "@emotion/styled";
import { DiagramEngine } from "@projectstorm/react-diagrams";
import { DiagramContext } from "../DiagramContext/DiagramContext";
import { CanvasControlButton } from "./ControlButtons/ControlButton";
import { Icon } from "@wso2-enterprise/ui-toolkit";
import { Colors } from "../../resources";

interface ControlProps {
    engine: DiagramEngine;
    showProblemPanel: () => void;
    refreshDiagram?: () => void;
}

export const ControlPanel: React.FC<any> = styled.div`
    bottom: 15px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    justify-content: space-between;
    position: absolute;
    right: 15px;
    width: 32px;
`;

export function DiagramControls(props: ControlProps) {
    const { engine, refreshDiagram, showProblemPanel } = props;
    const { hasDiagnostics } = useContext(DiagramContext);

    const onZoom = (zoomIn: boolean) => {
        const delta: number = zoomIn ? +5 : -5;
        engine.getModel().setZoomLevel(engine.getModel().getZoomLevel() + delta);
        engine.repaintCanvas();
    };

    const zoomToFit = () => {
        engine.zoomToFitNodes({ margin: 10, maxZoom: 1 });
    };

    const zoomToActualSize = () => {
        engine.getModel().setZoomLevel(100);
        engine.repaintCanvas();
    };

    return (
        <ControlPanel>
            {hasDiagnostics && (
                <CanvasControlButton onClick={showProblemPanel} tooltipTitle={"Diagnostics were detected in the model."}>
                    <Icon sx={{ color: Colors.CONTROL_BUTTON_STROKE_COLOR, marginTop: 4 }} name="warning"/>
                </CanvasControlButton>
            )}

            {refreshDiagram && (
                <CanvasControlButton onClick={refreshDiagram} tooltipTitle={"Refresh"}>
                    <Icon sx={{ color: Colors.CONTROL_BUTTON_STROKE_COLOR, marginTop: 4 }} name="refresh"/>
                </CanvasControlButton>
            )}

            <CanvasControlButton onClick={zoomToFit} tooltipTitle={"Zoom to fit nodes"}>
                <Icon sx={{ color: Colors.CONTROL_BUTTON_STROKE_COLOR, marginTop: 4 }} name="full-screen"/>
            </CanvasControlButton>

            <CanvasControlButton onClick={zoomToActualSize} tooltipTitle={"Zoom to actual size"}>
                <Icon sx={{ color: Colors.CONTROL_BUTTON_STROKE_COLOR, marginTop: 4 }} name="fit-screen"/>
            </CanvasControlButton>

            <div>
                <CanvasControlButton
                    onClick={() => {
                        onZoom(true);
                    }}
                    tooltipTitle={"Zoom in"}
                >
                    <Icon sx={{ color: Colors.CONTROL_BUTTON_STROKE_COLOR, marginTop: 4 }} name="add"/>
                </CanvasControlButton>

                <CanvasControlButton
                    onClick={() => {
                        onZoom(false);
                    }}
                    tooltipTitle={"Zoom out"}
                >
                    <Icon sx={{ color: Colors.CONTROL_BUTTON_STROKE_COLOR, marginTop: 4 }} name="remove"/>
                </CanvasControlButton>
            </div>
        </ControlPanel>
    );
}
