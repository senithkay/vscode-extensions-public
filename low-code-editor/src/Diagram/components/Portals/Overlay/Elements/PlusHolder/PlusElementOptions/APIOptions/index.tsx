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
import React, { ReactNode, SyntheticEvent, useContext, useState } from "react";

import { LocalVarDecl, STKindChecker } from "@ballerina/syntax-tree";
import { Divider } from "@material-ui/core";

import ExpEditorCollapseIcon from "../../../../../../../../assets/icons/ExpEditorCollapseIcon";
import ExpEditorExpandIcon from "../../../../../../../../assets/icons/ExpEditorExpandIcon";
import Tooltip from "../../../../../../../../components/TooltipV2";
import { Context } from "../../../../../../../../Contexts/Diagram";
import { DiagramEditorLangClientInterface } from "../../../../../../../../Definitions/diagram-editor-lang-client-interface";
import { BallerinaConnectorInfo, BallerinaConnectorsRequest, BallerinaConnectorsResponse, Connector } from "../../../../../../../../Definitions/lang-client-extended";
import { PlusViewState } from "../../../../../../../../Diagram/view-state/plus";
import { CirclePreloader } from "../../../../../../../../PreLoader/CirclePreloader";
import {
    EVENT_TYPE_AZURE_APP_INSIGHTS,
    LowcodeEvent,
    START_CONNECTOR_ADD_INSIGHTS,
    START_EXISTING_CONNECTOR_ADD_INSIGHTS
} from "../../../../../../../models";
import { addConnectorListToCache, getConnectorListFromCache } from "../../../../../../../utils/st-util";
import { FormGeneratorProps } from "../../../../../../FormGenerator";
import { getConnectorIconSVG, getExistingConnectorIconSVG, getFormattedModuleName } from "../../../../../utils";
import { APIHeightStates } from "../../PlusElements";
import "../../style.scss";

export interface APIOptionsProps {
    onSelect: (connector: BallerinaConnectorInfo, selectedConnector: LocalVarDecl) => void;
    onChange?: (type: string, subType: string, connector?: BallerinaConnectorInfo) => void;
    viewState?: PlusViewState;
    collapsed?: (value: APIHeightStates) => void
}

export interface ConnctorComponent {
    connectorInfo: BallerinaConnectorInfo;
    component: ReactNode;
}

export interface Connctors {
    connector: ConnctorComponent[];
    selectedCompoent: string;
}

export interface ExisitingConnctorComponent {
    connectorInfo: BallerinaConnectorInfo;
    component: ReactNode;
    key: string;
}
// TODO: need to fix props passing in FormGenerator
export function APIOptions(props: FormGeneratorProps) {
    const {
        props: { langServerURL, stSymbolInfo, currentFile },
        api: {
            helpPanel: {
                openConnectorHelp,
            },
            insights: {
                onEvent
            },
            ls: {
                getDiagramEditorLangClient,
            }
        }
    } = useContext(Context);
    const { onSelect, collapsed } = props.configOverlayFormStatus.formArgs as APIOptionsProps;
    const [selectedContName, setSelectedContName] = useState("");
    const [centralConnectors, setCentralConnectors] = useState<Connector[]>([]);
    const [localConnectors, setLocalConnectors] = useState<Connector[]>([]);
    const [showConnectorLoader, setShowConnectorLoader] = useState(true);

    const [isToggledExistingConnector, setToggledExistingConnector] = useState(true);
    const [isToggledSelectConnector, setToggledSelectConnector] = useState(true);

    const isExistingConnectors = stSymbolInfo.endpoints && Array.from(stSymbolInfo.endpoints).length > 0;

    React.useEffect(() => {
        fetchConnectors();
    }, []);

    let centralConnectorComponents : ReactNode[] = [];
    let localConnectorComponents : ReactNode[] = [];
    let existingConnectorComponents : ReactNode[] = [];

    const toggleExistingCon = () => {
        setToggledExistingConnector(!isToggledExistingConnector);
        if (!isToggledExistingConnector) {
            // setExistingConnectorCollapsed(true);
            collapsed(APIHeightStates.ExistingConnectors);
        } else if (isToggledExistingConnector) {
            collapsed(APIHeightStates.ExistingConnectorsColapsed);
        }
    }

    const toggleSelectCon = () => {
        setToggledSelectConnector(!isToggledSelectConnector);
        if (!isToggledSelectConnector) {
            // setSelectConnectorCollapsed(true);
            collapsed(APIHeightStates.SelectConnectors);
        } else if (isToggledSelectConnector) {
            collapsed(APIHeightStates.SelectConnectorsColapsed);
        }
    }

    const onSelectConnector = (connector: BallerinaConnectorInfo) => {
        const event: LowcodeEvent = {
            type: EVENT_TYPE_AZURE_APP_INSIGHTS,
            name: START_CONNECTOR_ADD_INSIGHTS,
            property: connector.displayName || connector.package.name
        };
        onEvent(event);
        onSelect(connector, undefined);
        openConnectorHelp(connector);
    }

    const onSelectExistingConnector = (connector: BallerinaConnectorInfo, selectedConnector: LocalVarDecl) => {
        const event: LowcodeEvent = {
            type: EVENT_TYPE_AZURE_APP_INSIGHTS,
            name: START_EXISTING_CONNECTOR_ADD_INSIGHTS,
            property: connector.displayName || connector.package.name
        };
        onEvent(event);
        openConnectorHelp(connector);
        onSelect(connector, selectedConnector);
    }

    const getConnectorComponents = (connectors: Connector[]): ReactNode[] => {
        const componentList: ReactNode[] = [];
        let tooltipSideCount = 0;
        connectors?.forEach((connector: Connector) => {
            const connectorName = connector.displayAnnotation?.label || connector.moduleName;
            const placement = (tooltipSideCount++) % 2 === 0 ? "left" : "right";
            const tooltipTitle = connectorName;
            const tooltipExample = connector.package.summary;
            const tooltipText = {
                "heading" : connectorName,
                "example" : tooltipExample,
                "content" : tooltipTitle
            }
            const component: ReactNode = (
                    <Tooltip type="example" text={tooltipText} placement={placement} arrow={true} interactive={true} key={connectorName.toLowerCase()}>
                        <div className="connect-option" key={connectorName} onClick={onSelectConnector.bind(this, connector)} data-testid={connectorName.toLowerCase()}>
                            <div className="connector-details product-tour-add-http">
                                <div className="connector-icon">
                                    {getConnectorIconSVG(connector)}
                                </div>
                                <div className="connector-name">
                                    {connectorName}
                                </div>
                            </div>
                        </div>
                    </Tooltip>
                );
            componentList.push(component);
        });
        return componentList;
    }

    const getExistingConnectorComponents = (): ReactNode[] => {
        const componentList: ReactNode[] = [];
        stSymbolInfo.endpoints.forEach((value: LocalVarDecl, key: string) => {
            // todo: need to add connector filtering here
            let moduleName: string;
            let name: string;
            if (STKindChecker.isQualifiedNameReference(value.typedBindingPattern.typeDescriptor)) {
                moduleName = value.typedBindingPattern.typeDescriptor?.modulePrefix?.value;
                name = value.typedBindingPattern.typeDescriptor?.identifier?.value;
            }
            const orgName = value.typedBindingPattern.bindingPattern.typeData?.typeSymbol?.moduleID?.orgName;
            if (moduleName && name) {
                const existConnector = getConnector(moduleName, name);
                const component: ReactNode = (
                    <>
                        { existConnector && (
                            <div className="existing-connect-option" key={key} onClick={onSelectExistingConnector.bind(this, existConnector, value)} data-testid={key.toLowerCase()}>
                                <div className="existing-connector-details product-tour-add-http">
                                    <div className="existing-connector-icon">
                                        {getExistingConnectorIconSVG(`${existConnector.moduleName}_${existConnector.package.name}`)}
                                    </div>
                                    <div className="existing-connector-name">
                                        {key}
                                    </div>
                                </div>
                            </div>
                        ) }
                        { !existConnector && (
                            <div className="existing-connect-option" key={key} data-testid={key.toLowerCase()}>
                                <div className="existing-connector-details product-tour-add-http">
                                    <div className="existing-connector-icon">
                                        {getExistingConnectorIconSVG(`${moduleName}_${orgName}`)}
                                    </div>
                                    <div className="existing-connector-name">
                                        {key}
                                    </div>
                                </div>
                            </div>
                        ) }
                    </>
                );
                componentList.push(component);
            }
        });
        return componentList;
    }

    const getConnector = (moduleName: string, name: string): BallerinaConnectorInfo => {
        centralConnectors.forEach(element => {
            const existingConnector = element as BallerinaConnectorInfo;
            const formattedModuleName = getFormattedModuleName(existingConnector.package.name);
            if (formattedModuleName === moduleName && existingConnector.name === name) {
                return existingConnector;
            }
        });
        return null;
    };

    const handleSearchChange = (evt: any) => {
        setSelectedContName(evt.target.value);
    };

    const handleSearchKeyPress = (event: any) => {
      if (event.key === "Enter") {
        fetchConnectors();
      }
    };

    const fetchConnectors = () => {
        setShowConnectorLoader(true);
        getDiagramEditorLangClient(langServerURL).then(
          (langClient: DiagramEditorLangClientInterface) => {
            const request: BallerinaConnectorsRequest = {
                targetFile: currentFile.path,
                packageName: selectedContName
            };

            langClient.getConnectors(request).then((response: BallerinaConnectorsResponse) => {
                if (response.central?.length > 0){
                    setCentralConnectors(response.central);
                }
                if (response.local?.length > 0){
                    setLocalConnectors(response.local);
                }
                if (selectedContName === "") {
                    // cached loaded connectors
                    addConnectorListToCache(response.central);
                }
                setShowConnectorLoader(false);
              });
          }
        );
    }

    const preventDiagramScrolling = (e: SyntheticEvent) => {
        e.stopPropagation();
    }

    if (!showConnectorLoader) {
        centralConnectorComponents = getConnectorComponents(centralConnectors);
        localConnectorComponents = getConnectorComponents(localConnectors);
        existingConnectorComponents = getExistingConnectorComponents();
    }

    return (
        <div onWheel={preventDiagramScrolling} className="connector-option-holder element-options no-margin" >
            { isExistingConnectors &&
                (
                    <>
                        <div className="existing-connect-wrapper">
                            <div className="title-wrapper">
                                <p className="plus-section-title">Choose existing connection </p>
                                { isToggledSelectConnector ?
                                    (
                                        <div onClick={toggleExistingCon} className="existing-connector-toggle">
                                            { isToggledExistingConnector ?
                                                <ExpEditorExpandIcon />
                                                :
                                                <ExpEditorCollapseIcon />
                                            }
                                        </div>
                                    )
                                    :
                                    null
                                }
                            </div>

                            { isToggledExistingConnector &&
                                (
                                    <div className="existing-connector-wrapper">
                                        { showConnectorLoader && (
                                            <div className="full-wrapper center-wrapper">
                                                <CirclePreloader position="relative" />
                                            </div>
                                        ) }
                                        {!showConnectorLoader && existingConnectorComponents}
                                    </div>
                                )
                            }
                        </div>
                        <Divider />
                    </>
                )
            }

            { localConnectors?.length > 0 && (
                <div className="element-option-holder" >
                    <div className="title-wrapper">
                        <p className="plus-section-title">Local connectors</p>
                    </div>
                    { isToggledSelectConnector &&
                        (
                            <div className={`api-options options-wrapper ${isExistingConnectors ? 'with-existing-con' : ''}`}>
                                {localConnectorComponents}
                            </div>
                        )
                    }
                </div>
            ) }

            <div className="element-option-holder" >
                <div className="title-wrapper">
                    <p className="plus-section-title">Create new connection</p>
                    { isExistingConnectors && isToggledExistingConnector ?
                        (
                            <div onClick={toggleSelectCon}>
                                { isToggledSelectConnector ?
                                    <ExpEditorExpandIcon />
                                    :
                                    <ExpEditorCollapseIcon />
                                }
                            </div>
                        )
                        :
                        null
                    }
                </div>
                { isToggledSelectConnector &&
                    (
                        <>
                            <div className="top-connector-wrapper">
                                <input
                                    type="search"
                                    placeholder="Search"
                                    value={selectedContName}
                                    onChange={handleSearchChange}
                                    onKeyPress={handleSearchKeyPress}
                                    className='search-wrapper'
                                />
                            </div>
                            <div className={`api-options options-wrapper ${isExistingConnectors ? 'with-existing-con' : ''}`}>
                                { showConnectorLoader && (
                                    <div className="full-wrapper center-wrapper">
                                        <CirclePreloader position="relative" />
                                    </div>
                                ) }
                                {!showConnectorLoader && centralConnectorComponents}
                                { !showConnectorLoader &&
                                    centralConnectorComponents.length === 0 && (
                                        <div className="full-wrapper center-wrapper no-connector-msg">
                                            No connectors found
                                        </div>
                                    ) }
                            </div>
                        </>
                    )
                }
            </div>
        </div>
    );
}
