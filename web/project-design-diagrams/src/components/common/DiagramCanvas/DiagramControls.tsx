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

import React from 'react';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import RemoveIcon from '@mui/icons-material/Remove';
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import { Colors } from '../../../resources';
import { ControlPanel, ExportButton } from './styles/styles';
import './styles/styles.css';


interface ControlProps {
    zoomToFit: () => void;
    onZoom: (zoomIn: boolean) => void;
    onDownload: () => void;
}

export function DiagramControls(props: ControlProps) {
    const { onDownload, onZoom, zoomToFit } = props;

    return (
        <>
            <ControlPanel>
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

            <ExportButton>
                <IconButton size='small' onClick={onDownload} >
                    <DownloadIcon
                        sx={{ color: Colors.PRIMARY }}
                        fontSize='medium'
                    />
                </IconButton>
            </ExportButton>
        </>
    )
}
