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
    const { hasDiagnostics } = useContext(DiagramContext);
    const { refreshDiagram } = useContext(DiagramContext);

    const isCellView = !showDownloadButton // We are hide download button form cell view. Hence, deriving from that

    return (
        <ControlPanel showDownloadButton={showDownloadButton} >
            {hasDiagnostics &&
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
            {isCellView && (
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
