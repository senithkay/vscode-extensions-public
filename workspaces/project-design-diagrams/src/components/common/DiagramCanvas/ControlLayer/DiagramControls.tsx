/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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
import WarningIcon from '@mui/icons-material/Warning';
import { CanvasControlButton } from '@wso2-enterprise/design-diagram-commons';
import { DiagramContext } from '../../DiagramContext/DiagramContext';
import { ControlPanel } from '../styles/styles';
import CachedIcon from "@mui/icons-material/Cached";
import '../styles/styles.css';

interface ControlProps {
    zoomToFit: () => void;
    showDownloadButton: boolean;
    onZoom: (zoomIn: boolean) => void;
    onDownload?: () => void;
}

export function DiagramControls(props: ControlProps) {
    const { onDownload, onZoom, zoomToFit, showDownloadButton = true } = props;
    const { editingEnabled, editLayerAPI, hasDiagnostics, refreshDiagram, consoleView } = useContext(DiagramContext);

    const diagnosticsOnClick = () => {
        if (editingEnabled) {
            editLayerAPI?.executeCommand('workbench.action.problems.focus');
        }
    }

    return (
        <ControlPanel showDownloadButton={showDownloadButton} >
            {hasDiagnostics && !consoleView &&
                <CanvasControlButton
                    onClick={diagnosticsOnClick}
                    tooltipTitle={consoleView ? 'Error while fetching diagram data' : 'Project contains diagnostics'}
                >
                    <WarningIcon sx={{ color: '#EA4C4D' }} />
                </CanvasControlButton>
            }
            {showDownloadButton && (
                <CanvasControlButton onClick={onDownload} tooltipTitle={'Download'}>
                    <DownloadIcon />
                </CanvasControlButton>
            )}
            {consoleView && (
                <CanvasControlButton onClick={refreshDiagram} tooltipTitle={'Refresh'}>
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
