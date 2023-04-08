/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import React, { useContext, useState } from 'react';
import { ElementLocation } from '@wso2-enterprise/ballerina-languageclient';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { DiagramContext } from '../../../DiagramContext/DiagramContext';
import { ContentTextProps, DefaultTextProps, TitleTextProps } from '../styles/styles';

interface DeleteDialogProps {
    location: ElementLocation;
    showDialog: boolean;
    updateShowDialog: (status: boolean) => void;
}

const DELETE_COMPONENT_VALUE = 'deleteComp';
const DELETE_PKG_VALUE = 'deletePkg';

export function DeleteComponentDialog(props: DeleteDialogProps) {
    const { location, showDialog, updateShowDialog } = props;
    const { deleteComponent, refreshDiagram } = useContext(DiagramContext);

    const [deletePkg, setDeletePkg] = useState<boolean>(true);

    const handleDeleteChoiceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if ((event.target as HTMLInputElement).value === DELETE_COMPONENT_VALUE) {
            setDeletePkg(false);
        } else {
            setDeletePkg(true);
        }
    }

    const handleDialogClose = () => {
        updateShowDialog(false);
    }

    const handleComponentDelete = () => {
        deleteComponent(location, deletePkg);
        handleDialogClose();
        refreshDiagram();
    }

    return (
        // Todo: Fix selected node handling on dialog open/close
        <Dialog open={showDialog} onClose={handleDialogClose}>
            <DialogTitle sx={TitleTextProps}>Delete Component</DialogTitle>
            <DialogContent>
                <DialogContentText sx={ContentTextProps}>
                    Please select an option.
                </DialogContentText>

                <RadioGroup
                    value={deletePkg ? DELETE_PKG_VALUE : DELETE_COMPONENT_VALUE}
                    id="delete-radio-buttons-group"
                    onChange={handleDeleteChoiceChange}
                >
                    <FormControlLabel
                        value={DELETE_PKG_VALUE}
                        control={<Radio />}
                        label={<span style={DefaultTextProps}>Delete the entire package</span>}
                    />
                    <FormControlLabel
                        value={DELETE_COMPONENT_VALUE}
                        control={<Radio />}
                        label={<span style={DefaultTextProps}>Delete only the service</span>}
                    />
                </RadioGroup>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDialogClose} sx={DefaultTextProps}>Cancel</Button>
                <Button
                    sx={DefaultTextProps}
                    color={'error'}
                    onClick={handleComponentDelete}
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}
