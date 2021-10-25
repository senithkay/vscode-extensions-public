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

import { LocalVarDecl, STKindChecker } from "@ballerina/syntax-tree";
import { Box, CircularProgress, Grid, Typography } from "@material-ui/core";

import Tooltip from "../../../components/TooltipV2";
import { Context } from "../../../Contexts/Diagram";
import { DiagramEditorLangClientInterface } from "../../../Definitions/diagram-editor-lang-client-interface";
import { BallerinaConnectorInfo, BallerinaConnectorsRequest, BallerinaConnectorsResponse, Connector } from "../../../Definitions/lang-client-extended";
import {
    EVENT_TYPE_AZURE_APP_INSIGHTS,
    LowcodeEvent,
    START_CONNECTOR_ADD_INSIGHTS,
    START_EXISTING_CONNECTOR_ADD_INSIGHTS
} from "../../models";
import { PlusViewState } from "../../view-state/plus";
import { FormGeneratorProps } from "../FormGenerator";
import { APIHeightStates } from "../Portals/Overlay/Elements/PlusHolder/PlusElements";
import { getConnectorIconSVG, getExistingConnectorIconSVG, getFormattedModuleName } from "../Portals/utils";

import FilterByMenu from "./FilterByMenu";
import SearchBar from "./SearchBar";
import useStyles from './style';

export interface ConnectorListProps {
    onSelect: (connector: BallerinaConnectorInfo, selectedConnector: LocalVarDecl) => void;
    onChange?: (type: string, subType: string, connector?: BallerinaConnectorInfo) => void;
    viewState?: PlusViewState;
    collapsed?: (value: APIHeightStates) => void;
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

export interface FilterStateMap {
    [ key: string ]: boolean;
}

export function ConnectorList(props: FormGeneratorProps) {
    const classes = useStyles();
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
    const { onSelect, collapsed } = props.configOverlayFormStatus.formArgs as ConnectorListProps;

    const [ searchQuery, setSearchQuery ] = useState("");
    const [ centralConnectors, setCentralConnectors ] = useState<Connector[]>([]);
    const [ localConnectors, setLocalConnectors ] = useState<Connector[]>([]);
    const [ isSearchResultsFetching, setIsSearchResultsFetching ] = useState(true);
    const [ isToggledExistingConnector, setToggledExistingConnector ] = useState(true);
    const [ isToggledSelectConnector, setToggledSelectConnector ] = useState(true);
    const [ filterState, setFilterState ] = useState<FilterStateMap>({});

    const isExistingConnectors = stSymbolInfo.endpoints && Array.from(stSymbolInfo.endpoints).length > 0;

    React.useEffect(() => {
        fetchConnectorList();
    }, []);

    let centralConnectorComponents: ReactNode[] = [];
    let localConnectorComponents: ReactNode[] = [];
    let existingConnectorComponents: ReactNode[] = [];

    const toggleExistingCon = () => {
        setToggledExistingConnector(!isToggledExistingConnector);
        if (!isToggledExistingConnector) {
            // setExistingConnectorCollapsed(true);
            collapsed(APIHeightStates.ExistingConnectors);
        } else if (isToggledExistingConnector) {
            collapsed(APIHeightStates.ExistingConnectorsColapsed);
        }
    };

    const toggleSelectCon = () => {
        setToggledSelectConnector(!isToggledSelectConnector);
        if (!isToggledSelectConnector) {
            // setSelectConnectorCollapsed(true);
            collapsed(APIHeightStates.SelectConnectors);
        } else if (isToggledSelectConnector) {
            collapsed(APIHeightStates.SelectConnectorsColapsed);
        }
    };

    const onSelectConnector = (connector: BallerinaConnectorInfo) => {
        const event: LowcodeEvent = {
            type: EVENT_TYPE_AZURE_APP_INSIGHTS,
            name: START_CONNECTOR_ADD_INSIGHTS,
            property: connector.displayName || connector.package.name
        };
        onEvent(event);
        onSelect(connector, undefined);
        openConnectorHelp(connector);
    };

    const onSelectExistingConnector = (connector: BallerinaConnectorInfo, selectedConnector: LocalVarDecl) => {
        const event: LowcodeEvent = {
            type: EVENT_TYPE_AZURE_APP_INSIGHTS,
            name: START_EXISTING_CONNECTOR_ADD_INSIGHTS,
            property: connector.displayName || connector.package.name
        };
        onEvent(event);
        openConnectorHelp(connector);
        onSelect(connector, selectedConnector);
    };

    const getConnectorComponents = (connectors: Connector[]): ReactNode[] => {
        const componentList: ReactNode[] = [];
        let tooltipSideCount = 0;
        connectors?.forEach((connector: Connector) => {
            const connectorName = connector.displayAnnotation?.label || connector.moduleName;
            const placement = (tooltipSideCount++) % 2 === 0 ? "left" : "right";
            const tooltipTitle = connectorName;
            const tooltipExample = connector.package.summary;
            const tooltipText = {
                "heading": connectorName,
                "example": tooltipExample,
                "content": tooltipTitle
            };
            const component: ReactNode = (
                <Tooltip type="example" text={ tooltipText } placement={ placement } arrow={ true } interactive={ true } key={ connectorName.toLowerCase() }>
                    <Grid item={ true } sm={ 6 } alignItems="center">
                        <div key={ connectorName } onClick={ onSelectConnector.bind(this, connector) } data-testid={ connectorName.toLowerCase() }>
                            <div className={ classes.connector }>
                                <div >
                                    { getConnectorIconSVG(connector) }
                                </div>
                                <div className={ classes.connectorName }>
                                    { connectorName }
                                </div>
                            </div>
                        </div>
                    </Grid>
                </Tooltip>
            );
            componentList.push(component);
        });
        return componentList;
    };

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
                            <div className="existing-connect-option" key={ key } onClick={ onSelectExistingConnector.bind(this, existConnector, value) } data-testid={ key.toLowerCase() }>
                                <div className="existing-connector-details product-tour-add-http">
                                    <div className="existing-connector-icon">
                                        { getExistingConnectorIconSVG(`${existConnector.moduleName}_${existConnector.package.name}`) }
                                    </div>
                                    <div className="existing-connector-name">
                                        { key }
                                    </div>
                                </div>
                            </div>
                        ) }
                        { !existConnector && (
                            <div className="existing-connect-option" key={ key } data-testid={ key.toLowerCase() }>
                                <div className="existing-connector-details product-tour-add-http">
                                    <div className="existing-connector-icon">
                                        { getExistingConnectorIconSVG(`${moduleName}_${orgName}`) }
                                    </div>
                                    <div className="existing-connector-name">
                                        { key }
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
    };

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

    const fetchConnectorList = (query?: string) => {
        setIsSearchResultsFetching(true);
        getDiagramEditorLangClient(langServerURL).then(
            (langClient: DiagramEditorLangClientInterface) => {
                const request: BallerinaConnectorsRequest = {
                    targetFile: currentFile.path,
                    packageName: query || searchQuery
                };
                langClient.getConnectors(request).then((response: BallerinaConnectorsResponse) => {
                    if (response.central?.length > 0) {
                        setCentralConnectors(response.central);
                    }
                    if (response.local?.length > 0) {
                        setLocalConnectors(response.local);
                    }
                    setIsSearchResultsFetching(false);
                });
            }
        );
    };

    const preventDiagramScrolling = (e: SyntheticEvent) => {
        e.stopPropagation();
    };

    const onSearchButtonClick = (query: string) => {
        setSearchQuery(query);
        fetchConnectorList(query);
    };

    if (!isSearchResultsFetching) {
        centralConnectorComponents = getConnectorComponents(centralConnectors);
        localConnectorComponents = getConnectorComponents(localConnectors);
        existingConnectorComponents = getExistingConnectorComponents();
    }

    return (
        <div onWheel={ preventDiagramScrolling } className={ classes.container } >
            <SearchBar
                searchQuery={ searchQuery }
                onSearchButtonClick={ onSearchButtonClick }
            />
            <Grid item={ true } sm={ 12 } container={ true }>
                <Grid item={ true } sm={ 5 }>
                    <FilterByMenu
                        filterState={ filterState }
                        setFilterState={ setFilterState }
                        filterValues={ [] }
                    />
                </Grid>
                <Grid
                    sm={ 7 }
                    container={ true }
                    item={ true }
                    alignItems="flex-start"
                >
                    { isSearchResultsFetching && (
                        <Grid
                            sm={ 12 }
                            item={ true }
                            container={ true }
                            alignItems="center"
                            className={ classes.msgContainer }
                        >
                            <Grid item={ true } sm={ 12 }>
                                <Box display="flex" justifyContent="center">
                                    <CircularProgress data-testid="marketplace-search-loader" />
                                </Box>
                                <Box display="flex" justifyContent="center">
                                    <Typography variant="body1">
                                        Loading...
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    ) }

                    <Grid
                        item={ true }
                        sm={ 12 }
                        container={ true }
                        direction="row"
                        justifyContent="flex-start"
                        spacing={ 2 }
                        className={ classes.connectorWrap }
                    >
                        { centralConnectors?.length > 0 && (
                            <>
                                <Grid item={ true } sm={ 12 } className={ classes.connectorListWrap }>
                                    <Grid item={ true } sm={ 6 } md={ 6 } lg={ 6 }>
                                        <Typography variant="h4">
                                            Public Connectors
                                        </Typography>
                                    </Grid>
                                </Grid>
                                { centralConnectorComponents }
                            </>
                        ) }
                        { localConnectors?.length > 0 && (
                            <>
                                <Grid item={ true } sm={ 12 } className={ classes.connectorListWrap }>
                                    <Grid item={ true } sm={ 6 } md={ 6 } lg={ 6 }>
                                        <Typography variant="h4">
                                            Local Connectors
                                        </Typography>
                                    </Grid>
                                </Grid>
                                { localConnectorComponents }
                            </>
                        ) }
                    </Grid>

                    { !isSearchResultsFetching && centralConnectorComponents.length === 0 && localConnectors.length === 0 && (
                        <Grid
                            sm={ 12 }
                            item={ true }
                            container={ true }
                            alignItems="center"
                            className={ classes.msgContainer }
                        >
                            <Grid item={ true } sm={ 12 }>
                                <Box display="flex" justifyContent="center">
                                    <Typography variant="body1">
                                        No connectors found.
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    ) }

                    {/* { isExistingConnectors &&
                        (
                            <>
                                <div className="existing-connect-wrapper">
                                    <div className="title-wrapper">
                                        <p className="plus-section-title">Choose existing connection </p>
                                        { isToggledSelectConnector ?
                                            (
                                                <div onClick={ toggleExistingCon } className="existing-connector-toggle">
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
                                                { isSearchResultsFetching && (
                                                    <div className="full-wrapper center-wrapper">
                                                        <CirclePreloader position="relative" />
                                                    </div>
                                                ) }
                                                { !isSearchResultsFetching && existingConnectorComponents }
                                            </div>
                                        )
                                    }
                                </div>
                                <Divider />
                            </>
                        )
                    } */}
                </Grid>
            </Grid>
        </div >
    );
}
