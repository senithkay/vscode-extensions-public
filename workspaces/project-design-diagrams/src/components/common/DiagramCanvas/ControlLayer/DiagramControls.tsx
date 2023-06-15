/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import React, { useContext } from 'react';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import RemoveIcon from '@mui/icons-material/Remove';
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import { DiagramContext } from '../../DiagramContext/DiagramContext';
import { DiagnosticsWarning } from './DiagnosticsWarning';
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
    const { hasDiagnostics, refreshDiagram, consoleView } = useContext(DiagramContext);

    return (
        <ControlPanel showDownloadButton={showDownloadButton} >
            {hasDiagnostics && !consoleView &&
                <DiagnosticsWarning />
            }
            {showDownloadButton && (
                <IconButton
                    className={'control-button'}
                    size='small'
                    onClick={onDownload}
                >
                    <DownloadIcon fontSize='medium' />
                </IconButton>
            )}
            {consoleView && (
                <IconButton
                    className={'control-button'}
                    size='small'
                    onClick={refreshDiagram}
                >
                    <CachedIcon fontSize='small' />
                </IconButton>
            )}
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
