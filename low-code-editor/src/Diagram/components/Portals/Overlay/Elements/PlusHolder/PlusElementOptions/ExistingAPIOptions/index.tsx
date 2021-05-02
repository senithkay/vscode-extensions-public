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
import React, { ReactNode, SyntheticEvent, useContext, useState } from "react";

import { LocalVarDecl } from "@ballerina/syntax-tree";

import { Context as DiagramContext } from "../../../../../../../../Contexts/Diagram";
import { BallerinaConnectorsInfo } from "../../../../../../../../Definitions/lang-client-extended";
import { PlusViewState } from "../../../../../../../view-state/plus";
import { getExistingConnectorIconSVG } from "../../../../../utils";
import "../../style.scss";
import { APIOptions } from "../APIOptions";

// import { BetaSVG } from "./BetaSVG";

export interface ExistingAPIOptionsProps {
    onSelect: (connector: BallerinaConnectorsInfo) => void;
    onChange?: (type: string, subType: string, connector?: BallerinaConnectorsInfo) => void;
    viewState?: PlusViewState;
}

export interface ConnctorComponent {
    connectorInfo: BallerinaConnectorsInfo;
    component: ReactNode;
    key: string;
}

export interface Connctors {
    connector: ConnctorComponent[];
    selectedCompoent: string;
}

export interface PlusStates {
    isAPICallsExisting?: boolean,
}

export function ExistingAPIOptions(props: ExistingAPIOptionsProps) {
    const { state } = useContext(DiagramContext);
    const { connectors, stSymbolInfo } = state;
    const { onSelect, onChange } = props;
    const [selectedContName, setSelectedContName] = useState("");

    const [createFromNew, setCreateFromNew] = useState<ReactNode>(undefined);

    // const [states, setStates] = useState<PlusStates>({
    //     isAPICallsExisting: true
    // });

    const getConnector = (orgName: string, moduleName: string): BallerinaConnectorsInfo => {
        // tslint:disable-next-line: no-unused-expression
        let returnConnnectorType;
        Array.from(connectors).forEach(element => {
            // tslint:disable-next-line: no-unused-expression
            const existingConnector = element as BallerinaConnectorsInfo;
            if (existingConnector.org === orgName && existingConnector.module === moduleName) {
                returnConnnectorType = existingConnector;
            }
        });
        return returnConnnectorType;
    }

    const connectorComponents: ConnctorComponent[] = [];
    if (connectors) {
        stSymbolInfo.endpoints.forEach((value: LocalVarDecl, key: string) => {
            const existingConnectorIcon = value.typedBindingPattern.typeDescriptor.source.trim().replace(":", "_");
            const orgName = value.typedBindingPattern.typeDescriptor.typeData.symbol.moduleID.orgName;
            const moduleName = value.typedBindingPattern.typeDescriptor.typeData.symbol.moduleID.moduleName;
            const connector = getConnector(orgName, moduleName);
            const component: ReactNode = (
                <div className="existing-connect-option" key={key} onClick={onSelect.bind(this, connector)} data-testid={key.toLowerCase()}>
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

            const connectorComponent: ConnctorComponent = {
                connectorInfo: connector,
                component,
                key
            }
            connectorComponents.push(connectorComponent);
        });
    }

    const handleSearchChange = (evt: any) => {
        setSelectedContName(evt.target.value);
    };

    const onAPITypeSelect = (connector: BallerinaConnectorsInfo) => {
        onChange("APIS", connector.displayName, connector);
        // todo: handle tour step
        // dispatchGoToNextTourStep("DIAGRAM_ADD_HTTP");
    };

    // tslint:disable-next-line: no-empty
    const handleApiSwitch = () => {
        setCreateFromNew(
            <APIOptions onSelect={onAPITypeSelect} />
        );
    }

    const exsitingConnectors: ReactNode[] = [];
    if (selectedContName !== "") {
        const allCnts: ConnctorComponent[] = connectorComponents.filter(el =>
            el.key.toLowerCase().includes(selectedContName.toLowerCase()));
        allCnts.forEach((allCnt) => {
            exsitingConnectors.push(allCnt.component);
        });
    } else {
        connectorComponents.forEach((allCnt) => {
            exsitingConnectors.push(allCnt.component);
        });
    }

    const preventDiagramScrolling = (e: SyntheticEvent) => {
        e.stopPropagation();
    }
    return (
        <div className="connector-option-holder" >
            <div className="search-options-wrapper">
                <label>Choose Existing connection </label>
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
            <div
                onWheel={preventDiagramScrolling}
            >
                <div className="element-option-holder" >
                    <div className="options-wrapper">
                        {exsitingConnectors}
                    </div>
                </div>
            </div>
            <div className="text-wrapper">
                <span className="or-text">Or</span> <span className="switch-link" onClick={handleApiSwitch} >Create new Connection</span>
            </div>
        </div>
    );
}
