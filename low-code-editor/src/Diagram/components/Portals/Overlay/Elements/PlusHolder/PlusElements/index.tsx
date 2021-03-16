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
import React, { useState } from "react";

import CloseIcon from '@material-ui/icons/Close';
import cn from "classnames";

import { DiagramOverlay, DiagramOverlayContainer, DiagramOverlayPosition } from '../../..';
import { BallerinaConnectorsInfo } from "../../../../../../../Definitions/lang-client-extended";
import { PlusViewState } from "../../../../../../view-state/plus";
import { OverlayBackground } from "../../../../../OverlayBackground";
import { APIOptions } from "../PlusElementOptions/APIOptions";
import { StatementOptions } from "../PlusElementOptions/StatementOptions";
import "../style.scss";

export interface PlusElementsProps {
    position?: DiagramOverlayPosition;
    isPlusActive?: boolean;
    onChange?: (type: string, subType: string, connector?: BallerinaConnectorsInfo) => void;
    onClose?: () => void;
    onComponentClick?: (value: string) => void;
    initPlus: boolean,
    // todo: handle the dispatch for the tour
    // dispatchGoToNextTourStep: (nextStepId: string) => void
    viewState: PlusViewState
}

export const PLUS_HOLDER_WIDTH = 376;
export const PLUS_HOLDER_STATEMENT_HEIGHT = 431;
export const PLUS_HOLDER_API_HEIGHT = 520;

export function PlusElements(props: PlusElementsProps) {
    const { position, onClose, onChange, onComponentClick, initPlus, viewState } = props;

    const [selectedItem, setSelectedItem] = useState("STATEMENT");

    const handleStatementClick = () => {
        setSelectedItem("STATEMENT");
        if (onComponentClick) {
            onComponentClick("STATEMENT");
        }
    };
    const handleAPIClick = () => {
        setSelectedItem("APIS");
        if (onComponentClick) {
            onComponentClick("APIS");
        }
        // todo: handle dispatch for tour
        // dispatchGoToNextTourStep("DIAGRAM_CLICK_API");
    };

    const onStatementTypeSelect = (processType: string) => {
        onChange("STATEMENT", processType);
        if (processType === "Respond") {
            // todo: handle the dispatch for the tour
            // dispatchGoToNextTourStep("DIAGRAM_ADD_RESPOND");
        }
    };

    const onAPITypeSelect = (connector: BallerinaConnectorsInfo) => {
        onChange("APIS", connector.displayName, connector);
        // todo: handle tour step
        // dispatchGoToNextTourStep("DIAGRAM_ADD_HTTP");
    };

    let component: React.ReactNode = null;
    switch (selectedItem) {
        case "STATEMENT": {
            component = (<StatementOptions onSelect={onStatementTypeSelect} viewState={viewState} />);
            break;
        }
        case "APIS": {
            component = (<APIOptions onSelect={onAPITypeSelect} />);
            break;
        }
    }
    const plusContainer = initPlus ? "initPlus-container" : "plus-container";
    const holderClass = (selectedItem !== "APIS") ? "holder-wrapper" : "holder-wrapper-large";

    return (
        <DiagramOverlayContainer>
            <DiagramOverlay
                className={plusContainer}
                position={position}
            >
                <div className={holderClass}>
                    {
                        !initPlus ?
                            (
                                <button className="close-button" onClick={onClose}>
                                    <CloseIcon />
                                </button>
                            ) : null
                    }
                    <div className="holder-options">
                        <div className="options" onClick={handleStatementClick}>
                            <div className={cn("statement-title", { active: selectedItem === "STATEMENT" })} data-testid={"statement-options"}>
                                Statements
                            </div>
                        </div>
                        <div className="options">

                            <div className={cn("api-title", "product-tour-api-title", { active: selectedItem === "APIS" })} onClick={handleAPIClick} data-testid={"api-options"}>
                                Connections
                            </div>
                        </div>
                    </div>
                    <div className="element-options">
                        {component}
                    </div>
                </div>
                {!initPlus && <OverlayBackground />}
            </DiagramOverlay>
        </DiagramOverlayContainer>
    );
}

// const mapDispatchToProps = {
//     dispatchGoToNextTourStep: goToNextTourStep
// }; todo: fix dispatch
