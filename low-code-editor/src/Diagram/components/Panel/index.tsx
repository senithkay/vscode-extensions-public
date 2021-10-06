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
// tslint:disable: jsx-no-multiline-js
import React from "react";

import { CloseRounded } from "../../../assets/icons";
import { OverlayBackground } from "../OverlayBackground";
import { ButtonWithIcon } from "../Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import { DiagramOverlayContainer } from "../Portals/Overlay";

import "./style.scss";

interface PanelProps {
    children: JSX.Element,
    onClose: () => void;
}

export function Panel(props: PanelProps) {
    const { children, onClose } = props;

    return (
        <div>
            <DiagramOverlayContainer
            >
                <div className="panel">
                    <div className="close-btn-wrap">
                        <ButtonWithIcon
                            className="panel-close-button"
                            onClick={onClose}
                            icon={<CloseRounded fontSize="small" />}
                        />
                    </div>
                    <div className="panel-form-wrapper">
                        {children}
                    </div>
                </div>
                <OverlayBackground />
            </DiagramOverlayContainer>
        </div>
    );
}
