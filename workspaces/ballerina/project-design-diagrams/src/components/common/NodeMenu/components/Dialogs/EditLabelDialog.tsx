/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
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
        if (annotation?.sourceLocation) {
            return annotation?.sourceLocation;
        } else if (node.nodeObject.sourceLocation) {
            return {
                ...node.nodeObject.sourceLocation,
                endPosition: node.nodeObject.sourceLocation.startPosition
            };
        }
    }

    const editComponentLabel = async () => {
        const updatedAnnotation: Annotation = {
            label: serviceLabel,
            id: annotation?.id || uuid(),
            sourceLocation: getAnnotationLocation()
        }
        await editLayerAPI.editDisplayLabel({ annotation: updatedAnnotation });
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
