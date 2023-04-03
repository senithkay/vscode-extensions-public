/**
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
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
import Fab from '@mui/material/Fab';
import { SxProps } from '@mui/material';
import { DiagramContext } from '../../components/common';
import { Colors, Views } from '../../resources';

const ButtonStyles: SxProps = {
    backgroundColor: Colors.PRIMARY,
    borderRadius: '2px',
    color: 'white',
    fontSize: '12px',
    marginInline: '2.5px',
    minWidth: '140px',
    '&:hover': {
        backgroundColor: '#4958ba'
    }
};

interface ControlsProps {
    setShowEditForm: (status: boolean) => void;
}

export function AddButton(props: ControlsProps) {
    const { setShowEditForm } = props;
    const { currentView, isChoreoProject, editLayerAPI } = useContext(DiagramContext);

    const onComponentAdd = () => {
        if (isChoreoProject && editLayerAPI) {
            editLayerAPI.executeCommand('wso2.choreo.component.create').catch((error: Error) => {
                editLayerAPI.showErrorMessage(error.message);
            })
        } else {
            setShowEditForm(true);
        }
    }

    return (
        <Fab
            id={'add-component-btn'}
            aria-label='add'
            variant='extended'
            size='small'
            onClick={onComponentAdd}
            sx={ButtonStyles}
            disabled={currentView === Views.TYPE}
        >
            <AddIcon sx={{ marginRight: '5px' }} />
            {currentView === Views.TYPE ? 'Type' : 'Component'}
        </Fab>
    )
}
