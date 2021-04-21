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

import CloseIcon from '@material-ui/icons/Close';
import cn from "classnames";

import { DiagramOverlay, DiagramOverlayContainer, DiagramOverlayPosition } from '../../..';
import Tooltip from "../../../../../../../components/Tooltip";
import { Context } from "../../../../../../../Contexts/Diagram";
import { BallerinaConnectorsInfo } from "../../../../../../../Definitions/lang-client-extended";
import { PlusViewState } from "../../../../../../view-state/plus";
import { OverlayBackground } from "../../../../../OverlayBackground";
import { tooltipMessages } from "../../../../utils/constants";
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
export const PLUS_HOLDER_STATEMENT_HEIGHT = 500;
export const PLUS_HOLDER_API_HEIGHT = 580;

export function PlusElements(props: PlusElementsProps) {
    const { position, onClose, onChange, onComponentClick, initPlus, viewState } = props;
    const { state } = useContext(Context);
    const { isCodeEditorActive } = state;
    const intl = useIntl();

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

    const plusHolderUITooltipMessages = {
        statementsPlusHolder: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.statements.tooltip.title",
                defaultMessage: "A collection of syntactic units that can be added to your application"
            }),
            actionText: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.statements.tooltip.actionText",
                defaultMessage: "Learn more about Statements"
            }),
            actionLink: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.statements.tooltip.actionTitle",
                defaultMessage: "https://github.com/wso2/choreo-docs/blob/master/portal-docs/statements.md"
            })
    },
        APIsPlusHolder: {
        title: intl.formatMessage({
            id: "lowcode.develop.configForms.plusHolder.plusElements.connections.tooltip.title",
            defaultMessage: "A collection of Connections that helps you integrate your application to external services"
        }),
        actionText: intl.formatMessage({
            id: "lowcode.develop.configForms.plusHolder.plusElements.connections.tooltip.actionText",
            defaultMessage: "Learn more about Connections"
        }),
        actionLink: intl.formatMessage({
            id: "lowcode.develop.configForms.plusHolder.plusElements.connections.tooltip.actionTitle",
            defaultMessage: "https://github.com/wso2/choreo-docs/blob/master/portal-docs/connector.md"
        })
},
}

    const plusHolder: ReactNode = (
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
                <Tooltip
                    title={plusHolderUITooltipMessages.statementsPlusHolder.title}
                    actionText={plusHolderUITooltipMessages.statementsPlusHolder.actionText}
                    actionLink={plusHolderUITooltipMessages.statementsPlusHolder.actionLink}
                    interactive={true}
                    placement="left"
                    arrow={true}
                >
                    <div className="options" onClick={handleStatementClick}>
                        <div className={cn("statement-title", { active: selectedItem === "STATEMENT" })} data-testid={"statement-options"}>
                        <FormattedMessage id="lowcode.develop.plusHolder.plusElements.statements.title" defaultMessage="Statements"/>
            </div>
                    </div>
                </Tooltip>
                <div className="options">

                    <Tooltip
                        title={plusHolderUITooltipMessages.APIsPlusHolder.title}
                        actionText={plusHolderUITooltipMessages.APIsPlusHolder.actionText}
                        actionLink={plusHolderUITooltipMessages.APIsPlusHolder.actionLink}
                        interactive={true}
                        placement="right"
                        arrow={true}
                    >
                        <div className={cn("api-title", "product-tour-api-title", { active: selectedItem === "APIS" })} onClick={handleAPIClick} data-testid={"api-options"}>
                        <FormattedMessage id="lowcode.develop.plusHolder.plusElements.connections.title" defaultMessage="Connections"/>
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
