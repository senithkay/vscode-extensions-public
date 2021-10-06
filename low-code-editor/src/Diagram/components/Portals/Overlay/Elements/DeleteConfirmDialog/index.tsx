/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-multiline-js
import React from 'react';
import { useIntl } from 'react-intl';

import { Button, ClickAwayListener } from "@material-ui/core";

import { useFunctionContext } from '../../../../../../Contexts/Function';
import { DiagramOverlay, DiagramOverlayContainer, DiagramOverlayPosition } from '../../index';

import "./style.scss";

export interface DeleteConfirmDialogProps {
    position: DiagramOverlayPosition;
    message?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    isFunctionMember?: boolean;
}

export function DeleteConfirmDialog(props: DeleteConfirmDialogProps) {
    const intl = useIntl();
    const { position, onConfirm, onCancel, isFunctionMember = true } = props;
    const { message = "Remove this logic block?" } = props;
    const { overlayId } = useFunctionContext();
    const removeButtonText = intl.formatMessage({
        id: "lowcode.develop.elements.deleteConfirmationDialog.removeButton.text",
        defaultMessage: "Remove"
    });
    const cancelButtonText = intl.formatMessage({
        id: "lowcode.develop.elements.deleteConfirmationDialog.cancelButton.text",
        defaultMessage: "Cancel"
    });

    return (
        <ClickAwayListener
            mouseEvent="onMouseDown"
            touchEvent="onTouchStart"
            onClickAway={onCancel}
        >
            <div>
                <DiagramOverlayContainer
                    divId={isFunctionMember ? overlayId : 'canvas-overlay'}
                >
                    <DiagramOverlay
                        className="delete-container"
                        position={position}
                    >
                        <p>{message}</p>

                        <Button variant="contained" className="cancelbtn" onClick={onCancel}>{cancelButtonText}</Button>
                        <Button data-testid="delete-logic-block-btn" variant="contained" className="deletebtn" onClick={onConfirm}>{removeButtonText}</Button>

                    </DiagramOverlay>
                </DiagramOverlayContainer>
            </div>
        </ClickAwayListener>

    );
}
