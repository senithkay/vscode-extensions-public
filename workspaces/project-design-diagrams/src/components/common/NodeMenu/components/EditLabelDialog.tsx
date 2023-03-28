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

import React, { CSSProperties, useContext, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { DiagramContext } from '../../DiagramContext/DiagramContext';
import { Location, ServiceAnnotation } from '../../../../resources';

interface EditLabelDialogProps {
    serviceAnnotation: ServiceAnnotation;
    serviceLocation: Location;
    showDialog: boolean;
    updateShowDialog: (status: boolean) => void;
}

const DefaultTextProps: CSSProperties = {
    fontFamily: 'GilmerRegular',
    fontSize: '14px'
}

const TitleTextProps: CSSProperties = {
    fontFamily: 'GilmerMedium',
    fontSize: '15px'
}

export function EditLabelDialog(props: EditLabelDialogProps) {
    const { serviceAnnotation, serviceLocation, showDialog, updateShowDialog } = props;
    const { editLayerAPI } = useContext(DiagramContext);

    const [serviceLabel, updateServiceLabel] = useState<string>(undefined);

    const getAnnotationLocation = (): Location => {
        if (serviceAnnotation?.elementLocation) {
            return serviceAnnotation.elementLocation;
        } else if (serviceLocation) {
            return {
                ...serviceLocation,
                endPosition: serviceLocation.startPosition
            };
        }
    }

    const editComponentLabel = async () => {
        const updatedAnnotation: ServiceAnnotation = {
            label: serviceLabel,
            id: serviceAnnotation?.id,
            elementLocation: getAnnotationLocation()
        }
        await editLayerAPI.editDisplayLabel(updatedAnnotation);
        handleDialogClose();
    }

    const handleLabelInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        updateServiceLabel(event.target.value);
    }

    const handleDialogClose = () => {
        updateServiceLabel(undefined);
        updateShowDialog(false);
    }

    return (
        <Dialog open={showDialog} onClose={handleDialogClose}>
            <DialogTitle sx={TitleTextProps}>Update Label</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    fullWidth
                    variant='standard'
                    value={serviceLabel || serviceAnnotation?.label}
                    onChange={handleLabelInput}
                    InputProps={{ sx: DefaultTextProps }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDialogClose} sx={DefaultTextProps} >Cancel</Button>
                <Button
                    sx={DefaultTextProps}
                    onClick={editComponentLabel}
                    disabled={serviceLabel === undefined || serviceLabel === serviceAnnotation?.label}
                >
                    Update
                </Button>
            </DialogActions>
        </Dialog>
    );
}
