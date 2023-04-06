/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */

// tslint:disable: jsx-no-lambda no-submodule-imports
import React from 'react';

import styled from "@emotion/styled";
import AddIcon from '@mui/icons-material/Add';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import RemoveIcon from '@mui/icons-material/Remove';
import IconButton from '@mui/material/IconButton';

interface ContainerControllerProps {
    zoomToFit: () => void;
    onZoom: (zoomIn: boolean) => void;
}

const ControlPanel: React.FC<any> = styled.div`
  bottom: 60px;
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
    const { onZoom, zoomToFit } = props;

    return (
        <ControlPanel>
            <div>
                <IconButton
                    className={'control-button'}
                    size='small'
                    onClick={zoomToFit}
                >
                    <FullscreenIcon fontSize='small'/>
                </IconButton>
            </div>
            <div>
                <IconButton
                    className={'control-button'}
                    size='small'
                    onClick={() => {onZoom(true)}}
                >
                    <AddIcon fontSize='small'/>
                </IconButton>
                <IconButton
                    className={'control-button'}
                    size='small'
                    onClick={() => {onZoom(false)}}
                >
                    <RemoveIcon fontSize='small'/>
                </IconButton>
            </div>
        </ControlPanel>
    )
}
