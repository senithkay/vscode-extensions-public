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

import { PrimaryButton } from "../../../components/Buttons/PrimaryButton";
import { FormGenerator } from "../FormGenerator";

import "./style.scss";

export interface PanelProps {
    panelOpen: boolean;
}

export function Panel(props: PanelProps) {
    const {
        panelOpen
    } = props;
    const [isPanelOpen, setIsPanelOpen] = useState(panelOpen);

    useEffect(() => {
        setIsPanelOpen(panelOpen);
    }, [panelOpen]);

    function togglePanel() {
        setIsPanelOpen(!isPanelOpen);
    }

    return (
        <div>
            {isPanelOpen &&
                // tslint:disable-next-line: jsx-wrap-multiline
                <>
                    <div className="panel">
                        {/* <FormGenerator /> */}
                    </div>
                </>
            }

            <div className="togglePanelButton">
                <PrimaryButton
                    dataTestId="save-btn"
                    text="panel"
                    onClick={togglePanel}
                // disabled={}
                />
            </div>
        </div>
    );
}
