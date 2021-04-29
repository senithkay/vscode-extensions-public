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

import { LocalVarDecl, QualifiedNameReference } from "@ballerina/syntax-tree";
import { Divider } from "@material-ui/core";

import { Context as DiagramContext } from "../../../../../../../../Contexts/Diagram";
import { BallerinaConnectorsInfo } from "../../../../../../../../Definitions/lang-client-extended";
import { PlusViewState } from "../../../../../../../../Diagram/view-state/plus";
import { tooltipExamples, tooltipTitles } from "../../../../../../../utils/connectors";
import Tooltip from "../../../../../ConfigForm/Elements/Tooltip";
import { getConnectorIconSVG, getExistingConnectorIconSVG } from "../../../../../utils";
import { APIHeightStates } from "../../PlusElements";
import "../../style.scss";

// import { BetaSVG } from "./BetaSVG";

export interface APIOptionsProps {
    onSelect: (connector: BallerinaConnectorsInfo, selectedConnector: LocalVarDecl) => void;
    onChange?: (type: string, subType: string, connector?: BallerinaConnectorsInfo) => void;
    viewState?: PlusViewState;
    setAPIholderHeight?: (value: APIHeightStates) => void;
}

export interface ConnctorComponent {
    connectorInfo: BallerinaConnectorsInfo;
    component: ReactNode;
}

export interface Connctors {
    connector: ConnctorComponent[];
    selectedCompoent: string;
}

export interface ExisitingConnctorComponent {
    connectorInfo: BallerinaConnectorsInfo;
    component: ReactNode;
    key: string;
}

export function APIOptions(props: APIOptionsProps) {
    const { state } = useContext(DiagramContext);
    const { connectors, stSymbolInfo, targetPosition, setAPIholderHeight, viewState } = state;
    const { onSelect } = props;
    const [selectedContName, setSelectedContName] = useState("");
    const [isToggledExistingConnector, setToggledExistingConnector] = useState(true);
    const [isToggledSelectConnector, setToggledSelectConnector] = useState(true);
    const [isExistingConnectorCollapsed, setExistingConnectorCollapsed] = useState(false);
    const [isSelectConnectorCollapsed, setSelectConnectorCollapsed] = useState(false);

    const isExistingConnectors = stSymbolInfo.endpoints && Array.from(stSymbolInfo.endpoints).length > 0;

    const toggleExistingCon = () => {
        setToggledExistingConnector(!isToggledExistingConnector);
        if (!isToggledExistingConnector) {
            setExistingConnectorCollapsed(true);
            setAPIholderHeight(APIHeightStates.ExistingColapsed);
            // tslint:disable-next-line: no-unused-expression
            viewState.isExistingConnectorCollapsed = true;
        } else {
            setAPIholderHeight(APIHeightStates.Existing);
            viewState.isExistingConnectorCollapsed = false;
        }
    }

    const toggleSelectCon = () => {
        setToggledSelectConnector(!isToggledSelectConnector);
        if (!isToggledSelectConnector) {
            setSelectConnectorCollapsed(true);
            setAPIholderHeight(APIHeightStates.CreateColapsed);
            viewState.isSelectConnectorCollapsed = true;
        } else {
            setAPIholderHeight(APIHeightStates.Create);
            viewState.isSelectConnectorCollapsed = false;
        }
    }

    const exsitingConnectorComponents: ExisitingConnctorComponent[] = [];
    const connectorComponents: ConnctorComponent[] = [];
    if (connectors) {
        connectors.forEach((connector: any, index: number) => {
            const placement = index % 2 === 0 ? 'left' : 'right';
            const tooltipTitle = tooltipTitles[connector.displayName.toUpperCase()];
            const tooltipExample = tooltipExamples[connector.displayName.toUpperCase()];
            const component: ReactNode = (
                <Tooltip title={tooltipTitle} placement={placement} arrow={true} example={true} interactive={true} codeSnippet={true} content={tooltipExample}>
                    <div className="connect-option" key={connector.displayName} onClick={onSelect.bind(this, connector, undefined)} data-testid={connector.displayName.toLowerCase()}>
                        <div className="connector-details product-tour-add-http">
                            <div className="connector-icon">
                                {getConnectorIconSVG(connector)}
                            </div>
                            <div className="connector-name">
                                {connector.displayName}
                            </div>
                        </div>
                    </div>
                </Tooltip>
            );
            const connectorComponent: ConnctorComponent = {
                connectorInfo: connector,
                component
            }
            connectorComponents.push(connectorComponent);
        });

        const getConnector = (moduleName: string, name: string): BallerinaConnectorsInfo => {
            // tslint:disable-next-line: no-unused-expression
            let returnConnnectorType;
            Array.from(connectors).forEach(element => {
                // tslint:disable-next-line: no-unused-expression
                const existingConnector = element as BallerinaConnectorsInfo;
                if (existingConnector.module === moduleName && existingConnector.name === name) {
                    returnConnnectorType = existingConnector;
                }
            });
            return returnConnnectorType;
        }

        stSymbolInfo.endpoints.forEach((value: LocalVarDecl, key: string) => {
            const existingConnectorIcon = value.typedBindingPattern.typeDescriptor.source.trim().replace(":", "_");
            const moduleName = (value.typedBindingPattern.typeDescriptor as QualifiedNameReference).modulePrefix.value;
            const name = (value.typedBindingPattern.typeDescriptor as QualifiedNameReference).identifier.value;
            const existConnector = getConnector(moduleName, name);
            const component: ReactNode = (
                <div className="existing-connect-option" key={key} onClick={onSelect.bind(this, existConnector, value)} data-testid={key.toLowerCase()}>
                    <div className="existing-connector-details product-tour-add-http">
                        <div className="existing-connector-icon">
                            {getExistingConnectorIconSVG(existingConnectorIcon)}
                        </div>
                        <div className="existing-connector-name">
                            {key}
                        </div>
                    </div>
                </div>
            );
            const exsitingConnectorComponent: ExisitingConnctorComponent = {
                connectorInfo: existConnector,
                component,
                key
            }
            // todo Connector filtering here
            // const connectorPosition = value.position;
            // const connectorClientViewState: ViewState = (model === null)
            //      ? blockViewState.draft[1]
            //      : model.viewState as StatementViewState;
            // const draftVS: any = connectorClientViewState as DraftStatementViewState;
            // const connectorTargetPosition = targetPosition as DraftInsertPosition;
            // if (connectorPosition.startLine > connectorTargetPosition.line) {
            //     exsitingConnectorComponents.push(exsitingConnectorComponent);
            // }
            exsitingConnectorComponents.push(exsitingConnectorComponent);
        });
    }

    const handleSearchChange = (evt: any) => {
        setSelectedContName(evt.target.value);
    };

    const genericConnectors: ReactNode[] = [];
    const serviceConnectors: ReactNode[] = [];
    if (selectedContName !== "") {
        const allCnts: ConnctorComponent[] = connectorComponents.filter(el =>
            el.connectorInfo.displayName.toLowerCase().includes(selectedContName.toLowerCase()));
        allCnts.forEach((allCnt) => {
            if (allCnt.connectorInfo.category === "generic-connectors") {
                genericConnectors.push(allCnt.component);
            } else if (allCnt.connectorInfo.category === "service-connectors") {
                serviceConnectors.push(allCnt.component);
            }
        });
    } else {
        connectorComponents.forEach((allCnt) => {
            if (allCnt.connectorInfo.category === "generic-connectors") {
                genericConnectors.push(allCnt.component);
            } else if (allCnt.connectorInfo.category === "service-connectors") {
                serviceConnectors.push(allCnt.component);
            }
        });
    }
    const exsitingConnectors: ReactNode[] = [];
    if (selectedContName !== "") {
        const allCnts: ExisitingConnctorComponent[] = exsitingConnectorComponents.filter(el =>
            el.key.toLowerCase().includes(selectedContName.toLowerCase()));
        allCnts.forEach((allCnt) => {
            exsitingConnectors.push(allCnt.component);
        });
    } else {
        exsitingConnectorComponents.forEach((allCnt) => {
            exsitingConnectors.push(allCnt.component);
        });
    }

    return (
        <div className="connector-option-holder" >
            {isExistingConnectors &&
                (
                    <div className="existing-connect-wrapper">
                        <div className="title-wrapper">
                            <p className="plus-section-title">Choose Existing Connectors </p>
                            <div onClick={toggleExistingCon} className="existing-connector-toggle">
                                {isToggledExistingConnector && isToggledSelectConnector ?
                                    <img src="../../../../../../images/exp-editor-expand.svg" />
                                    :
                                    <img src="../../../../../../images/exp-editor-collapse.svg" />
                                }
                            </div>
                        </div>

                        {isToggledExistingConnector &&
                            (
                                <div className="existing-connector-wrapper">
                                    {exsitingConnectors}
                                </div>
                            )
                        }
                    </div>
                )
            }

            <Divider />

            <div className="element-option-holder" >
                <div className="title-wrapper">
                    <p className="plus-section-title">Choose new connection</p>
                    {isExistingConnectors && isToggledExistingConnector ?
                        (
                            <div onClick={toggleSelectCon}>
                                {isToggledSelectConnector ?
                                    <img src="../../../../../../images/exp-editor-expand.svg" />
                                    :
                                    <img src="../../../../../../images/exp-editor-collapse.svg" />
                                }
                            </div>
                        )
                        :
                        null
                    }
                </div>
                {isToggledSelectConnector &&
                    (
                        <>
                            <div className="top-connector-wrapper">
                                <input
                                    type="search"
                                    placeholder="Search"
                                    value={selectedContName}
                                    onChange={handleSearchChange}
                                    className='search-wrapper'
                                />
                            </div>
                            <div className="options-wrapper">
                                {/* {(genericConnectors.length > 0 ? <Divider /> : null)} */}
                                {genericConnectors}
                                {(serviceConnectors.length > 0 ? <Divider /> : null)}
                                {serviceConnectors}
                            </div>
                        </>
                    )
                }
            </div>
        </div>
    );
}
