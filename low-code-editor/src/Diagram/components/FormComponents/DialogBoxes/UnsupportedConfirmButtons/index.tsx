/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import * as React from "react";

import { Button } from "@material-ui/core";

import { OverlayBackground } from "../../../OverlayBackground";
import { DiagramOverlayContainer } from "../../../Portals/Overlay";

import "./style.scss";

export interface UnsupportedConfirmButtonsProps {
    onConfirm?: () => void,
    onCancel?: () => void
}

export function UnsupportedConfirmButtons(props: UnsupportedConfirmButtonsProps) {
    const { onConfirm, onCancel } = props;

    const handleOnConfirm = (evt: React.MouseEvent) => {
        evt.stopPropagation();
        onConfirm();
    }

    const handleOnCancel = (evt: React.MouseEvent) => {
        evt.stopPropagation();
        onCancel();
    }

    return (
        <DiagramOverlayContainer>
            <div className="container-wrapper">
                <div className="confirm-container" >
                    <p>Diagram editing for this is unsupported. Move to code?</p>
                    <div className={'action-button-container'}>
                        <Button variant="contained" className="cancelbtn" onClick={handleOnCancel}>No</Button>
                        <Button variant="contained" className="confirmbtn" onClick={handleOnConfirm}>Yes</Button>
                    </div>
                </div>
            </div>
            <OverlayBackground />
        </DiagramOverlayContainer>
    );
}
