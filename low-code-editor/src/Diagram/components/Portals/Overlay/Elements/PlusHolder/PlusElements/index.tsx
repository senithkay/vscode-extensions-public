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
import React, { ReactNode, useContext, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { LocalVarDecl } from "@ballerina/syntax-tree";
import CloseIcon from '@material-ui/icons/Close';
import cn from "classnames";

import { DiagramOverlay, DiagramOverlayContainer, DiagramOverlayPosition } from '../../..';
import Tooltip from "../../../../../../../components/Tooltip";
import { Context } from "../../../../../../../Contexts/Diagram";
import { BallerinaConnectorsInfo } from "../../../../../../../Definitions/lang-client-extended";
import { PlusViewState } from "../../../../../../view-state/plus";
import { OverlayBackground } from "../../../../../OverlayBackground";
import { APIOptions } from "../PlusElementOptions/APIOptions";
import { StatementOptions } from "../PlusElementOptions/StatementOptions";
import "../style.scss";

export interface PlusElementsProps {
    position?: DiagramOverlayPosition;
    isPlusActive?: boolean;
    onChange?: (type: string, subType: string, connector?: BallerinaConnectorsInfo, isExisting?: boolean, selectedConnector?: LocalVarDecl) => void;
    onClose?: () => void;
    onComponentClick?: (value: string) => void;
    initPlus: boolean,
    // todo: handle the dispatch for the tour
    // dispatchGoToNextTourStep: (nextStepId: string) => void
    viewState: PlusViewState
    setAPIholderHeight?: (value: APIHeightStates) => void;
}

export enum APIHeightStates {
    SelectConnectors,
    ExistingConnectors,
    SelectConnectorsColapsed,
    ExistingConnectorsColapsed
}

export const PLUS_HOLDER_WIDTH = 376;
export const PLUS_HOLDER_STATEMENT_HEIGHT = 464;
export const PLUS_HOLDER_API_HEIGHT = 490;
export const EXISTING_PLUS_HOLDER_API_HEIGHT = 680;
export const EXISTING_PLUS_HOLDER_WIDTH = 286;
export const PLUS_HOLDER_API_HEIGHT_COLLAPSED = 344;
export const EXISTING_PLUS_HOLDER_API_HEIGHT_COLLAPSED = 525;

export function PlusElements(props: PlusElementsProps) {
    const { position, onClose, onChange, onComponentClick, initPlus, viewState, setAPIholderHeight } = props;
    const { state, diagramRedraw } = useContext(Context);
    const { isCodeEditorActive, stSymbolInfo, syntaxTree } = state;
    const intl = useIntl();
    // const [isAPICallsExisting] = useState(stSymbolInfo.endpoints && Array.from(stSymbolInfo.endpoints).length > 0);
    const [isAPIHightState, setAPIHightState] = useState(APIHeightStates.SelectConnectors);

    if (stSymbolInfo.endpoints && Array.from(stSymbolInfo.endpoints).length > 0) {
        viewState.isAPICallsExisting = true;
    }

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

    const onAPITypeSelect = (connector: BallerinaConnectorsInfo, selectedConnector: LocalVarDecl) => {
        if (selectedConnector) {
            onChange("APIS", "Existing", connector, true, selectedConnector);
        } else {
            onChange("APIS", "New", connector);
        }

        // todo: handle tour step
        // dispatchGoToNextTourStep("DIAGRAM_ADD_HTTP");
    };

    const setApiHeight = (value: APIHeightStates) => {
        if (value === APIHeightStates.SelectConnectors) {
            viewState.isAPICallsExistingCreateCollapsed = false;
        } else if (value === APIHeightStates.ExistingConnectors) {
            viewState.isAPICallsExistingCollapsed = false;
        } else if (value === APIHeightStates.SelectConnectorsColapsed) {
            viewState.isAPICallsExistingCreateCollapsed = true;
        } else if (value === APIHeightStates.ExistingConnectorsColapsed) {
            viewState.isAPICallsExistingCollapsed = true;
        }
        diagramRedraw(syntaxTree);
    }

    let component: React.ReactNode = null;
    switch (selectedItem) {
        case "STATEMENT": {
            component = (<StatementOptions onSelect={onStatementTypeSelect} viewState={viewState} />);
            break;
        }
        case "APIS": {
            component = (<APIOptions collapsed={setApiHeight} onSelect={onAPITypeSelect} />);
            break;
        }
    }
    const plusContainer = initPlus ? "initPlus-container" : "plus-container";
    const exitingApiCall = viewState.isAPICallsExisting ? "existing-holder-class" : "holder-wrapper-large"
    const holderClass = selectedItem !== "APIS" ? "holder-wrapper" : exitingApiCall;

    const plusHolderUITooltipMessages = {
        statementsPlusHolder: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.statements.tooltip.title",
                defaultMessage: "A collection of code fragments that can be added to your application."
            })
        },
        APIsPlusHolder: {
        title: intl.formatMessage({
            id: "lowcode.develop.configForms.plusHolder.plusElements.connections.tooltip.title",
            defaultMessage: "A collection of API calls that helps you to integrate your application to external services."
        })
},
}

    const plusHolder: ReactNode = (
        <div className="holder-wrapper-large">
            {
                !initPlus ?
                    (
                        <button className="close-button" onClick={onClose}>
                            <CloseIcon />
                        </button>
                    ) : null
            }
            <div className="holder-options">
                <Tooltip
                    title={plusHolderUITooltipMessages.statementsPlusHolder.title}
                    interactive={true}
                    placement="left"
                    arrow={true}
                >
                    <div className="options" onClick={handleStatementClick}>
                        <div className={cn("statement-title", { active: selectedItem === "STATEMENT" })} data-testid={"statement-options"}>
                            <FormattedMessage id="lowcode.develop.plusHolder.plusElements.statements.title" defaultMessage="Statements" />
                        </div>
                    </div>
                </Tooltip>
                <div className="options">

                    <Tooltip
                        title={plusHolderUITooltipMessages.APIsPlusHolder.title}
                        interactive={true}
                        placement="right"
                        arrow={true}
                    >
                        <div className={cn("api-title", "product-tour-api-title", { active: selectedItem === "APIS" })} onClick={handleAPIClick} data-testid={"api-options"}>
                            <FormattedMessage id="lowcode.develop.plusHolder.plusElements.connections.title" defaultMessage="API Calls" />
                        </div>
                    </Tooltip>
                </div>
            </div>
            <div className="element-options">
                {component}
            </div>
        </div>
    );

    return (
        <DiagramOverlayContainer>
            <DiagramOverlay
                className={plusContainer}
                position={position}
            >
                {isCodeEditorActive && !initPlus ? <div className="plus-overlay"><OverlayBackground /></div> : null}
                {initPlus && isCodeEditorActive ? null : <>{plusHolder}</>}
                {!initPlus && <OverlayBackground />}
            </DiagramOverlay>
        </DiagramOverlayContainer>
    );
}

// const mapDispatchToProps = {
//     dispatchGoToNextTourStep: goToNextTourStep
// }; todo: fix dispatch
