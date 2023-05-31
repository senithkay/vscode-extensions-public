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
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import RemoveIcon from '@mui/icons-material/Remove';
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import styled from '@emotion/styled';
import CachedIcon from "@mui/icons-material/Cached";
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { toJpeg } from 'html-to-image';
import { DiagnosticsWarning } from './DiagnosticsWarning';
import { DiagramContext } from '../DiagramContext/DiagramContext';

import './styles.css';

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
        engine.zoomToFitNodes({ maxZoom: 1 });
    }

    return (
        <ControlPanel >
            {hasDiagnostics && <DiagnosticsWarning showProblemPanel={showProblemPanel} />}
            <IconButton
                className={'control-button'}
                size='small'
                onClick={downloadDiagram}
            >
                <DownloadIcon fontSize='medium' />
            </IconButton>
            <IconButton
                className={'control-button'}
                size='small'
                onClick={refreshDiagram}
            >
                <CachedIcon fontSize='small' />
            </IconButton>
            <IconButton
                className={'control-button'}
                size='small'
                onClick={zoomToFit}
            >
                <FullscreenIcon fontSize='small' />
            </IconButton>

            <div>
                <IconButton
                    className={'control-button'}
                    size='small'
                    onClick={() => { onZoom(true) }}
                >
                    <AddIcon fontSize='small' />
                </IconButton>
                <IconButton
                    className={'control-button'}
                    size='small'
                    onClick={() => { onZoom(false) }}
                >
                    <RemoveIcon fontSize='small' />
                </IconButton>
            </div>
        </ControlPanel>
    )
}
