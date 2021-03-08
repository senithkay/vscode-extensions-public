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

import { Button, ClickAwayListener } from "@material-ui/core";

import { DiagramOverlay, DiagramOverlayContainer, DiagramOverlayPosition } from '../../index';

import "./style.scss";

export interface SourceUpdateConfirmDialogProps {
    position: DiagramOverlayPosition;
    title?: string;
    subTitle?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

export function SourceUpdateConfirmDialog(props: SourceUpdateConfirmDialogProps) {

    const { position, onConfirm, onCancel } = props;
    const { title = "Do you want to update?", subTitle = "Updating trigger will remove your current source code"  } = props;
    return (
        <ClickAwayListener
            mouseEvent="onMouseDown"
            touchEvent="onTouchStart"
            onClickAway={onCancel}
        >
            <div>
                <DiagramOverlayContainer>
                    <DiagramOverlay
                        className="update-container"
                        position={position}
                    >
                        <p className="title">{title}</p>
                        <p className="subtitle">{subTitle}</p>

                        <Button variant="contained" className="cancelbtn" onClick={onCancel}>Cancel</Button>
                        <Button variant="contained" className="updatebtn" onClick={onConfirm}>Update</Button>

                    </DiagramOverlay>
                </DiagramOverlayContainer>
            </div>
        </ClickAwayListener>

    );
}
