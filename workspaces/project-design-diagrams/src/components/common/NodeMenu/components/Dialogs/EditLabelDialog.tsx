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
import { CMLocation as Location, CMAnnotation as Annotation } from '@wso2-enterprise/ballerina-languageclient';
import { v4 as uuid } from 'uuid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { DiagramContext } from '../../../DiagramContext/DiagramContext';
import { DefaultTextProps, TitleTextProps } from '../styles/styles';
import { EntryNodeModel, ServiceNodeModel } from '../../../../service-interaction';

interface EditLabelDialogProps {
    node: ServiceNodeModel | EntryNodeModel;
    showDialog: boolean;
    updateShowDialog: (status: boolean) => void;
}

export function EditLabelDialog(props: EditLabelDialogProps) {
    const { node, showDialog, updateShowDialog } = props;
    const { editLayerAPI, refreshDiagram } = useContext(DiagramContext);

    const annotation: Annotation = node.nodeObject.annotation;
    const [serviceLabel, updateServiceLabel] = useState<string>(annotation?.label);

    const getAnnotationLocation = (): Location => {
        if (annotation?.elementLocation) {
            return annotation?.elementLocation;
        } else if (node.nodeObject.elementLocation) {
            return {
                ...node.nodeObject.elementLocation,
                endPosition: node.nodeObject.elementLocation.startPosition
            };
        }
    }

    const editComponentLabel = async () => {
        const updatedAnnotation: Annotation = {
            label: serviceLabel,
            id: annotation?.id || uuid(),
            elementLocation: getAnnotationLocation()
        }
        await editLayerAPI.editDisplayLabel(updatedAnnotation);
        refreshDiagram();
        handleDialogClose();
    }

    const handleLabelInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        updateServiceLabel(event.target.value);
    }

    const handleDialogClose = () => {
        updateServiceLabel(annotation?.label);
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
                    value={serviceLabel}
                    onChange={handleLabelInput}
                    InputProps={{ sx: DefaultTextProps }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDialogClose} sx={DefaultTextProps}>Cancel</Button>
                <Button
                    sx={DefaultTextProps}
                    onClick={editComponentLabel}
                    disabled={!serviceLabel || serviceLabel === annotation?.label}
                >
                    Update
                </Button>
            </DialogActions>
        </Dialog>
    );
}
