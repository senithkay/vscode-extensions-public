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

import Divider from "@material-ui/core/Divider/Divider";

import Tooltip from "../../../../../../../../components/Tooltip";
import { Context as DiagramContext } from "../../../../../../../../Contexts/Diagram";
import { BallerinaConnectorsInfo } from "../../../../../../../../Definitions/lang-client-extended";
import { tooltipExamples, tooltipTitles } from "../../../../../../../utils/connectors";
import { getConnectorIconSVG } from "../../../../../utils";
import "../../style.scss";

// import { BetaSVG } from "./BetaSVG";

export interface APIOptionsProps {
    onSelect: (connector: BallerinaConnectorsInfo) => void;
}

export interface ConnctorComponent {
    connectorInfo: BallerinaConnectorsInfo;
    component: ReactNode;
}

export interface Connctors {
    connector: ConnctorComponent[];
    selectedCompoent: string;
}

export function APIOptions(props: APIOptionsProps) {
    const { state } = useContext(DiagramContext);
    const { connectors } = state;
    const { onSelect } = props;
    const [selectedContName, setSelectedContName] = useState("");

    const connectorComponents: ConnctorComponent[] = [];
    if (connectors) {
        connectors.forEach((connector: any, index: number) => {
            const placement = index % 2 === 0 ? 'left' : 'right';
            const tooltipTitle = tooltipTitles[connector.displayName.toUpperCase()];
            const tooltipExample = tooltipExamples[connector.displayName.toUpperCase()];
            const component: ReactNode = (
                <Tooltip title={tooltipTitle} placement={placement} arrow={true} example={true} interactive={true} codeSnippet={true} content={tooltipExample}>
                    <div className="connect-option" key={connector.displayName} onClick={onSelect.bind(this, connector)} data-testid={connector.displayName.toLowerCase()}>
                        <div className="connector-details product-tour-add-http">
                            <div className="connector-icon">
                                {getConnectorIconSVG(connector)}
                            </div>
                            <div className="connector-name">
                                {connector.displayName}
                            </div>
                            {/* <div className="beta-btn-wrapper">
                                {(connector.beta) && <BetaSVG />}
                            </div> */}
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

    return (
        <div className="connector-option-holder" >
            <div className="search-options-wrapper">
                <label>Choose from list</label>
            </div>
            <div className="top-connector-wrapper">
                <input
                    type="search"
                    placeholder="Search"
                    value={selectedContName}
                    onChange={handleSearchChange}
                    className='search-wrapper'
                />
            </div>
            <div className="element-option-holder" >
                <div className="options-wrapper">
                    {(genericConnectors.length > 0 ? <Divider /> : null)}
                    {genericConnectors}
                    {(serviceConnectors.length > 0 ? <Divider /> : null)}
                    {serviceConnectors}
                </div>
            </div>
        </div>
    );
}
