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
import Fab from '@mui/material/Fab';
import { SxProps } from '@mui/material';
import { DiagramContext } from '../../components/common';
import { Colors, Views } from '../../resources';

const ButtonStyles: SxProps = {
    backgroundColor: Colors.PRIMARY,
    borderRadius: '5px',
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
    const { currentView, isChoreoProject, editLayerAPI, isMultiRootWs, setIsMultiRootWs, addComponent } = useContext(DiagramContext);

    const onComponentAdd = async () => {
        if (isChoreoProject && editLayerAPI) {
            editLayerAPI.executeCommand('wso2.choreo.component.create').catch((error: Error) => {
                editLayerAPI.showErrorMessage(error.message);
            })
        } else if (addComponent) {
            addComponent();
        } else {
            let multiRootWs: boolean = isMultiRootWs;
            if (isMultiRootWs === undefined) {
                await editLayerAPI.checkIsMultiRootWs().then((response: boolean) => {
                    multiRootWs = response;
                    setIsMultiRootWs(response);
                });
            }
            if (multiRootWs) {
                setShowEditForm(true);
            } else {
                editLayerAPI.promptWorkspaceConversion();
            }
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
