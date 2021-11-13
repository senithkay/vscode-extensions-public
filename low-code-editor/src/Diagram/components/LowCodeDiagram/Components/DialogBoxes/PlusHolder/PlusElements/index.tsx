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
import { useIntl } from "react-intl";

import { LocalVarDecl } from "@ballerina/syntax-tree";
import CloseIcon from '@material-ui/icons/Close';

import { Context } from "../../../../../../../Contexts/Diagram";
import { useFunctionContext } from "../../../../../../../Contexts/Function";
import { BallerinaConnectorInfo } from "../../../../../../../Definitions/lang-client-extended";
import { OverlayBackground } from "../../../../../OverlayBackground";
import { DiagramOverlay, DiagramOverlayContainer, DiagramOverlayPosition } from '../../../../../Portals/Overlay';
import { PlusViewState } from "../../../../ViewState/plus";
import { StatementOptions } from "../PlusElementOptions/StatementOptions";
import "../style.scss";

export interface PlusElementsProps {
    position?: DiagramOverlayPosition;
    isPlusActive?: boolean;
    onChange?: (type: string, subType: string, connector?: BallerinaConnectorInfo, isExisting?: boolean, selectedConnector?: LocalVarDecl) => void;
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
export const PLUS_HOLDER_API_HEIGHT = 625;
export const EXISTING_PLUS_HOLDER_API_HEIGHT = 612;
export const EXISTING_PLUS_HOLDER_WIDTH = 498;
export const PLUS_HOLDER_API_HEIGHT_COLLAPSED = 321;
export const EXISTING_PLUS_HOLDER_API_HEIGHT_COLLAPSED = 660;

export function PlusElements(props: PlusElementsProps) {
    const { position, onClose, onChange, onComponentClick, initPlus, viewState } = props;
    const {
        actions: { diagramRedraw },
        props: { isCodeEditorActive, stSymbolInfo, syntaxTree },
        api: {
            insights: {
                onEvent,
            },
            helpPanel: {
                openConnectorHelp
            }
        }
    } = useContext(Context);
    const { overlayId, overlayNode } = useFunctionContext();

    const intl = useIntl();
    // const [isAPICallsExisting] = useState(stSymbolInfo.endpoints && Array.from(stSymbolInfo.endpoints).length > 0);
    const [isAPIHightState, setAPIHightState] = useState(APIHeightStates.SelectConnectors);

    if (stSymbolInfo.endpoints && Array.from(stSymbolInfo.endpoints).length > 0) {
        viewState.isAPICallsExisting = true;
    }

    const [selectedItem, setSelectedItem] = useState("STATEMENT");


    const onStatementTypeSelect = (processType: string) => {
        if (processType === "Connector"){
            onChange("APIS", "New", null);
        } else{
            onChange("STATEMENT", processType);
        }
        if (processType === "Respond") {
            // todo: handle the dispatch for the tour
            // dispatchGoToNextTourStep("DIAGRAM_ADD_RESPOND");
        }
        // if (processType === "DataMapper") {
        //     // FIXME: Found this while enabling types for context. We are reusing help panel action in a wrong way
        //     openConnectorHelp({moduleName: processType});
        // }
    };



    const plusContainer = initPlus ? "initPlus-container" : "plus-container";
    const exitingApiCall = viewState.isAPICallsExisting ? "existing-holder-class" : "holder-wrapper-large"


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
            <div className="element-options">
                <StatementOptions onSelect={onStatementTypeSelect} viewState={viewState} />
            </div>
        </div>
    );

    return (
        <>
            {overlayNode && (
                <DiagramOverlayContainer
                    divId={overlayId}
                >
                    <DiagramOverlay
                        className={plusContainer}
                        position={position}
                    >
                        {isCodeEditorActive && !initPlus ? <div className="plus-overlay"><OverlayBackground /></div> : null}
                        {initPlus && isCodeEditorActive ? null : <>{plusHolder}</>}
                        {!initPlus && <OverlayBackground />}
                    </DiagramOverlay>
                </DiagramOverlayContainer>
            )}
        </>
    );
}

// const mapDispatchToProps = {
//     dispatchGoToNextTourStep: goToNextTourStep
// }; todo: fix dispatch
