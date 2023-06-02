/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import React, { useContext } from 'react';
import AddIcon from '@mui/icons-material/Add';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import RemoveIcon from '@mui/icons-material/Remove';
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import styled from '@emotion/styled';
import CachedIcon from "@mui/icons-material/Cached";
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { CanvasControlButton, DiagnosticsWarning } from '@wso2-enterprise/design-diagram-commons';
import { toJpeg } from 'html-to-image';
import { DiagramContext } from '../DiagramContext/DiagramContext';

interface ControlProps {
    engine: DiagramEngine;
    refreshDiagram: () => void;
    showProblemPanel: () => void;
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

    const downloadDiagram = () => {
        const canvas: HTMLDivElement = engine.getCanvas();
        if (!canvas) {
            return;
        }

        toJpeg(canvas, { cacheBust: true, quality: 0.95, width: canvas.scrollWidth, height: canvas.scrollHeight })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = 'er-diagram.jpeg';
                link.href = dataUrl;
                link.click();
            })
            .catch((err) => {
                console.log(err.message);
            });
    }

    const onZoom = (zoomIn: boolean) => {
        let delta: number = zoomIn ? +5 : -5;
        engine.getModel().setZoomLevel(engine.getModel().getZoomLevel() + delta);
        engine.repaintCanvas();
    }

    const zoomToFit = () => {
        engine.zoomToFitNodes({ margin: 10, maxZoom: 1 });
    }

    return (
        <ControlPanel >
            {hasDiagnostics &&
                <DiagnosticsWarning
                    onClick={showProblemPanel}
                    tooltipTitle={'Diagnostics were detected in the model.'}
                />
            }
            <CanvasControlButton onClick={downloadDiagram}>
                <DownloadIcon />
            </CanvasControlButton>

            <CanvasControlButton onClick={refreshDiagram}>
                <CachedIcon />
            </CanvasControlButton>

            <CanvasControlButton onClick={zoomToFit}>
                <FullscreenIcon />
            </CanvasControlButton>

            <div>
                <CanvasControlButton onClick={() => { onZoom(true) }}>
                    <AddIcon />
                </CanvasControlButton>

                <CanvasControlButton onClick={() => { onZoom(false) }}>
                    <RemoveIcon />
                </CanvasControlButton>
            </div>
        </ControlPanel>
    )
}
