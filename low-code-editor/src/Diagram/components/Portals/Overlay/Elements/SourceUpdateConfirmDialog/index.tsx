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

import { Button } from "@material-ui/core";
import { CloseRounded } from "@material-ui/icons";

import { OverlayBackground } from "../../../../OverlayBackground";
import { ButtonWithIcon } from "../../../ConfigForm/Elements/Button/ButtonWithIcon";
import { DiagramOverlay, DiagramOverlayContainer, DiagramOverlayPosition } from "../../index";

import "./style.scss";

export interface SourceUpdateConfirmDialogProps {
    title?: string;
    subTitle?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

export const overlayPosition: DiagramOverlayPosition = {
    x: 630,
    y: 215
}

export function SourceUpdateConfirmDialog(props: SourceUpdateConfirmDialogProps) {

    const { onConfirm, onCancel, title, subTitle } = props;

    return (
        <div>
            <OverlayBackground confirmationOverlay={true} />
            <DiagramOverlayContainer>
                <DiagramOverlay
                    className="update-container"
                    position={overlayPosition}
                >
                    <ButtonWithIcon
                        className="closeIcon"
                        onClick={onCancel}
                        icon={<CloseRounded fontSize="small" />}
                    />
                    <p className="title"> {title ? title : "Do you want to update?"} </p>
                    {subTitle ? (
                        <p className="subtitle"> {subTitle} </p>
                    ) : (
                        <p className="subtitle">Updating trigger will remove your current source code</p>
                    )}

                    <div className="updateBtnWrapper">
                        <Button
                            variant="contained"
                            className={"cancelBtn"}
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            className={"updateBtn"}
                            onClick={onConfirm}
                        >
                            Update
                        </Button>
                    </div>

                </DiagramOverlay>
            </DiagramOverlayContainer>
        </div>
    );
}
