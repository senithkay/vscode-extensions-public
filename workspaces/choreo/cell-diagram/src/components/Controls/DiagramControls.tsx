/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext } from 'react';
import AddIcon from '@mui/icons-material/Add';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import RemoveIcon from '@mui/icons-material/Remove';
import WarningIcon from '@mui/icons-material/Warning';
import styled from '@emotion/styled';
import CachedIcon from "@mui/icons-material/Cached";
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { DiagramContext } from '../DiagramContext/DiagramContext';
import { CanvasControlButton } from './ControlButtons/ControlButton';

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
    }

    const zoomToFit = () => {
        engine.zoomToFitNodes({ margin: 10, maxZoom: 1 });
    }

    return (
        <ControlPanel >
            {hasDiagnostics && (
                <CanvasControlButton onClick={showProblemPanel} tooltipTitle={'Diagnostics were detected in the model.'}>
                    <WarningIcon sx={{ color: '#EA4C4D' }} />
                </CanvasControlButton>
            )}

            {refreshDiagram && (
                <CanvasControlButton onClick={refreshDiagram} tooltipTitle={"Refresh"}>
                    <CachedIcon />
                </CanvasControlButton>
            )}

            <CanvasControlButton onClick={zoomToFit} tooltipTitle={'Zoom to fit nodes'}>
                <FullscreenIcon />
            </CanvasControlButton>

            <div>
                <CanvasControlButton onClick={() => { onZoom(true) }} tooltipTitle={'Zoom in'}>
                    <AddIcon />
                </CanvasControlButton>

                <CanvasControlButton onClick={() => { onZoom(false) }} tooltipTitle={'Zoom out'}>
                    <RemoveIcon />
                </CanvasControlButton>
            </div>
        </ControlPanel>
    )
}
