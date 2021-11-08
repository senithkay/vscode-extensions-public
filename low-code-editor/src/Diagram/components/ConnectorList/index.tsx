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
import { FormattedMessage } from "react-intl";

import { LocalVarDecl } from "@ballerina/syntax-tree";
import { Box, CircularProgress, FormControl, Grid, Typography } from "@material-ui/core";
import { CloseRounded } from "@material-ui/icons";

import { Context } from "../../../Contexts/Diagram";
import { DiagramEditorLangClientInterface } from "../../../Definitions/diagram-editor-lang-client-interface";
import { BallerinaConnectorInfo, BallerinaConnectorsRequest, BallerinaConnectorsResponse, Connector } from "../../../Definitions/lang-client-extended";
import { EVENT_TYPE_AZURE_APP_INSIGHTS, LowcodeEvent, START_CONNECTOR_ADD_INSIGHTS } from "../../models";
import { PlusViewState } from "../../view-state/plus";
import { FormGeneratorProps } from "../FormGenerator";
import { ButtonWithIcon } from "../Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import { useStyles as useFormStyles } from "../Portals/ConfigForm/forms/style";
import { APIHeightStates } from "../Portals/Overlay/Elements/PlusHolder/PlusElements";
import { getConnectorIconSVG } from "../Portals/utils";

import FilterByMenu from "./FilterByMenu";
import SearchBar from "./SearchBar";
import useStyles from "./style";

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
    [key: string]: boolean;
}

export function ConnectorList(props: FormGeneratorProps) {
    const classes = useStyles();
    const formClasses = useFormStyles();
    const {
        props: { langServerURL, stSymbolInfo, currentFile, userInfo },
        api: {
            helpPanel: { openConnectorHelp },
            insights: { onEvent },
            ls: { getDiagramEditorLangClient },
        },
    } = useContext(Context);
    const { onSelect } = props.configOverlayFormStatus.formArgs as ConnectorListProps;

    const [centralConnectors, setCentralConnectors] = useState<Connector[]>([]);
    const [localConnectors, setLocalConnectors] = useState<Connector[]>([]);
    const [isSearchResultsFetching, setIsSearchResultsFetching] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [filterState, setFilterState] = useState<FilterStateMap>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [isNextPageFetching, setIsNextPageFetching] = useState(false);

    const connectorLimit = 14;

    React.useEffect(() => {
        fetchConnectorList();
    }, [searchQuery, selectedCategory, filterState]);

    let centralConnectorComponents: ReactNode[] = [];
    let localConnectorComponents: ReactNode[] = [];

    const onSelectConnector = (connector: BallerinaConnectorInfo) => {
        const event: LowcodeEvent = {
            type: EVENT_TYPE_AZURE_APP_INSIGHTS,
            name: START_CONNECTOR_ADD_INSIGHTS,
            property: connector.displayName || connector.package.name,
        };
        onEvent(event);
        onSelect(connector, undefined);
        openConnectorHelp(connector);
    };

    const getConnectorComponents = (connectors: Connector[]): ReactNode[] => {
        const componentList: ReactNode[] = [];
        connectors?.forEach((connector: Connector) => {
            const connectorName = (connector.displayAnnotation?.label || `${connector.package?.name} / ${connector.name}`).replace(/["']/g, "");
            const component: ReactNode = (
                <Grid item={true} sm={6} alignItems="center">
                    <div key={connectorName} onClick={onSelectConnector.bind(this, connector)} data-testid={connectorName.toLowerCase()}>
                        <div className={classes.connector}>
                            <div>{getConnectorIconSVG(connector)}</div>
                            <div className={classes.connectorName}>{connectorName}</div>
                            <div className={classes.orgName}>by {connector.package.organization}</div>
                        </div>
                    </div>
                </Grid>
            );
            componentList.push(component);
        });
        return componentList;
    };

    const fetchConnectorList = (page?: number) => {
        page ? setIsNextPageFetching(true) : setIsSearchResultsFetching(true);
        getDiagramEditorLangClient(langServerURL).then((langClient: DiagramEditorLangClientInterface) => {
            const request: BallerinaConnectorsRequest = {
                targetFile: currentFile.path,
                query: searchQuery,
                keyword: selectedCategory,
                limit: connectorLimit,
            };

            const hasUserOrgFilter = filterState.hasOwnProperty("My Organization") ? filterState["My Organization"] : false;
            if (hasUserOrgFilter && userInfo) {
                request.organization = userInfo.selectedOrgHandle;
            }

            if (page) {
                request.offset = (page - 1) * connectorLimit;
            }

            langClient.getConnectors(request).then((response: BallerinaConnectorsResponse) => {
                if (response.central?.length > 0) {
                    page ? setCentralConnectors([...centralConnectors, ...response.central]) : setCentralConnectors(response.central);
                }
                if (response.local?.length > 0) {
                    setLocalConnectors(response.local);
                }
                page ? setIsNextPageFetching(false) : setIsSearchResultsFetching(false);
            });
        });
    };

    const preventDiagramScrolling = (e: SyntheticEvent) => {
        e.stopPropagation();
    };

    const onSearchButtonClick = (query: string) => {
        setSearchQuery(query);
    };

    const updateCategory = (category: string) => {
        setSelectedCategory(category);
    };

    const clearCategory = () => {
        setSelectedCategory("");
    };

    const handleConnectorListScroll = (e: React.UIEvent<HTMLElement>) => {
        const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop === e.currentTarget.clientHeight;
        if (bottom && !isSearchResultsFetching) {
            fetchConnectorList(currentPage + 1);
            setCurrentPage(currentPage + 1);
        }
    };

    if (!isSearchResultsFetching) {
        centralConnectorComponents = getConnectorComponents(centralConnectors);
        localConnectorComponents = getConnectorComponents(localConnectors);
    }

    return (
        <FormControl data-testid="log-form" className={classes.container}>
            <div className={formClasses.formWrapper}>
                <div className={formClasses.formFeilds}>
                    <div className={formClasses.formWrapper}>
                        <div className={formClasses.formTitleWrapper}>
                            <div className={formClasses.mainTitleWrapper}>
                                <Typography variant="h4">
                                    <Box paddingTop={2} paddingBottom={2}>
                                        <FormattedMessage id="lowcode.develop.configForms.connectorList.title" defaultMessage="API Call" />
                                    </Box>
                                </Typography>
                            </div>
                        </div>

                        <div onWheel={preventDiagramScrolling} className={classes.container}>
                            <SearchBar searchQuery={searchQuery} onSearchButtonClick={onSearchButtonClick} />
                            <Grid item={true} sm={12} container={true}>
                                <Grid item={true} sm={5}>
                                    <FilterByMenu
                                        filterState={filterState}
                                        setFilterState={setFilterState}
                                        filterValues={[]}
                                        selectedCategory={selectedCategory}
                                        setCategory={updateCategory}
                                    />
                                </Grid>
                                <Grid sm={7} container={true} item={true} className={classes.resultsContainer}>
                                    {isSearchResultsFetching && (
                                        <Grid sm={12} item={true} container={true} className={classes.msgContainer}>
                                            <Grid item={true} sm={12}>
                                                <Box display="flex" justifyContent="center">
                                                    <CircularProgress data-testid="marketplace-search-loader" />
                                                </Box>
                                                <Box display="flex" justifyContent="center">
                                                    <Typography variant="body1">Loading...</Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    )}

                                    {!isSearchResultsFetching && selectedCategory !== "" && (
                                        <Grid sm={12} item={true} container={true} alignItems="center">
                                            <Box display="flex" justifyContent="center" alignItems="center" className={classes.filterTag}>
                                                <Typography variant="body1">{selectedCategory}</Typography>
                                                <ButtonWithIcon
                                                    className={classes.filterRemoveBtn}
                                                    onClick={clearCategory}
                                                    icon={<CloseRounded fontSize="small" />}
                                                />
                                            </Box>
                                        </Grid>
                                    )}

                                    <Grid
                                        item={true}
                                        sm={12}
                                        container={true}
                                        direction="row"
                                        justifyContent="flex-start"
                                        spacing={2}
                                        className={classes.connectorListWrap}
                                        onScroll={handleConnectorListScroll}
                                    >
                                        {!isSearchResultsFetching && localConnectors?.length > 0 && (
                                            <>
                                                <Grid item={true} sm={12} className={classes.connectorSectionWrap}>
                                                    <Grid item={true} sm={6} md={6} lg={6}>
                                                        <Typography variant="h4">Local APIs</Typography>
                                                    </Grid>
                                                </Grid>
                                                {localConnectorComponents}
                                            </>
                                        )}
                                        {!isSearchResultsFetching && centralConnectors?.length > 0 && (
                                            <>
                                                <Grid item={true} sm={12} className={classes.connectorSectionWrap}>
                                                    <Grid item={true} sm={6} md={6} lg={6}>
                                                        <Typography variant="h4">Public APIs</Typography>
                                                    </Grid>
                                                </Grid>
                                                {centralConnectorComponents}
                                            </>
                                        )}
                                        {!isSearchResultsFetching && isNextPageFetching && (
                                            <Grid item={true} sm={12} className={classes.connectorSectionWrap}>
                                                <Box display="flex" justifyContent="center">
                                                    <Typography variant="body1">Loading more APIs...</Typography>
                                                </Box>
                                            </Grid>
                                        )}
                                    </Grid>

                                    {!isSearchResultsFetching && centralConnectorComponents.length === 0 && localConnectors.length === 0 && (
                                        <Grid sm={12} item={true} container={true} alignItems="center" className={classes.msgContainer}>
                                            <Grid item={true} sm={12}>
                                                <Box display="flex" justifyContent="center">
                                                    <Typography variant="body1">No APIs found.</Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    )}
                                </Grid>
                            </Grid>
                        </div>
                    </div>
                </div>
            </div>
        </FormControl>
    );
}
