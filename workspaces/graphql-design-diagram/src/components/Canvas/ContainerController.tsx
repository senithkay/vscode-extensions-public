/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

// tslint:disable: jsx-no-lambda no-submodule-imports
import React from 'react';

import styled from "@emotion/styled";
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from "@mui/icons-material/FileDownloadOutlined";
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import RemoveIcon from '@mui/icons-material/Remove';
import { Tooltip } from "@mui/material";
import IconButton from '@mui/material/IconButton';

interface ContainerControllerProps {
    zoomToFit: () => void;
    onZoom: (zoomIn: boolean) => void;
    onDownload?: () => void;
}

const ControlPanel: React.FC<any> = styled.div`
  bottom: 40px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  justify-content: space-between;
  position: absolute;
  right: 15px;
  width: 32px;
  height: fit-content;
  min-height: max-content;

  .control-button {
    background-color: white !important;
    border: 1px solid #E0E2E9 !important;
    border-radius: 2px !important;
    height: 32px !important;
    width: 32px !important;
  }
`;


export function ContainerController(props: ContainerControllerProps) {
    const { onZoom, zoomToFit, onDownload } = props;

    return (
        <ControlPanel>
            <div>
                <Tooltip title="Download" disableInteractive={true}>
                    <IconButton
                        className={'control-button'}
                        size='small'
                        onClick={onDownload}
                    >
                        <DownloadIcon fontSize='medium' />
                    </IconButton>
                </Tooltip>
            </div>
            <div>
                <Tooltip title="Fit to screen" disableInteractive={true}>
                    <IconButton
                        className={'control-button'}
                        size='small'
                        onClick={zoomToFit}
                    >
                        <FullscreenIcon fontSize='small' />
                    </IconButton>
                </Tooltip>
            </div>
            <div>
                <Tooltip title="Zoom in" disableInteractive={true}>
                    <IconButton
                        className={'control-button'}
                        size='small'
                        onClick={() => {onZoom(true)}}
                    >
                        <AddIcon fontSize='small' />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Zoom out" disableInteractive={true}>
                    <IconButton
                        className={'control-button'}
                        size='small'
                        onClick={() => {onZoom(false)}}
                    >
                        <RemoveIcon fontSize='small' />
                    </IconButton>
                </Tooltip>
            </div>
        </ControlPanel>
    )
}
