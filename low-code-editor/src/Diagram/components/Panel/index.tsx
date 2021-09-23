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
import React, { useContext, useEffect, useState } from "react";

import { CloseIcon } from "../../../assets/icons";
import { PrimaryButton } from "../../../components/Buttons/PrimaryButton";
import { CanvasDiagram } from "../CanvasContainer";
import { FormGenerator } from "../FormGenerator";
import { DiagramOverlayContainer } from "../Portals/Overlay";

import "./style.scss";

export function Panel(props: any) {
    const { children, onClose, showClose } = props;
    const [isPanelOpen, setIsPanelOpen] = useState(true);

    function togglePanel() {
        setIsPanelOpen(!isPanelOpen);
    }

    return (
        // <div>
        //     {isPanelOpen &&
        //         // tslint:disable-next-line: jsx-wrap-multiline
        //         <>
        //             <div className="form-generator">
        //                 {/* <FormGenerator /> */}
        //             </div>
        //         </>
        //     }

        //     <div className="togglePanelButton">
        //         <PrimaryButton
        //             dataTestId="save-btn"
        //             text="panel"
        //             onClick={togglePanel}
        //         // disabled={}
        //         />
        //     </div>
        // </div>
        <div>
            <DiagramOverlayContainer>
                {isPanelOpen &&
                    (
                        <div className="panel">
                            <div className="header">
                                <p className="title">title</p>
                                {(showClose) && (
                                    <button className="closeBtnWrapper" onClick={onClose}>
                                        <CloseIcon className="closeBtn" />
                                    </button>
                                )}
                            </div>
                            {children}
                            <div className="togglePanelButton">
                                <PrimaryButton
                                    dataTestId="save-btn"
                                    text="panel"
                                    onClick={togglePanel}
                                // disabled={}
                                />
                            </div>
                        </div>
                    )
                }

            </DiagramOverlayContainer>
        </div>
    );
}
