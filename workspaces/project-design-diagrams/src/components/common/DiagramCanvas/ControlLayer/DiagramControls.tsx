/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
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
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import WarningIcon from '@mui/icons-material/Warning';
import CachedIcon from "@mui/icons-material/Cached";
import { DiagramContext } from '../../DiagramContext/DiagramContext';
import { CanvasControlButton } from './ControlButtons/ControlButton';
import { ControlPanel } from '../styles/styles';
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
