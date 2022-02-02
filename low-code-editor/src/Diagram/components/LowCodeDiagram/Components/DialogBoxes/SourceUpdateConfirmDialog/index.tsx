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
import React, { useContext } from 'react';
import { useIntl } from 'react-intl';

import { Button } from "@material-ui/core";
import { CloseRounded } from "@material-ui/icons";
import { ButtonWithIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { OverlayBackground } from "../../../../OverlayBackground";
import { DiagramOverlay, DiagramOverlayContainer, DiagramOverlayPosition } from "../../../../Portals/Overlay/index";

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
    const intl = useIntl();
    const { onConfirm, onCancel, title, subTitle } = props;

    const triggerUpdateWarningMessage = intl.formatMessage({
        id: "lowcode.develop.updateTrigger.triggerUpdateWarning.message.text",
        defaultMessage: "Updating a trigger removes your current source code."
    });

    const handleOnConfirm = () => {
        onConfirm();
    }

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
                        <p className="subtitle">{triggerUpdateWarningMessage}</p>
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
                            onClick={handleOnConfirm}
                        >
                            Update
                        </Button>
                    </div>

                </DiagramOverlay>
            </DiagramOverlayContainer>
        </div>
    );
}
