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

import { Context } from "../../../../../Contexts/Diagram";
import { BallerinaModule, BallerinaModuleResponse } from "../../../../../Definitions/lang-client-extended";
import { UserState } from "../../../../../types";
import { EVENT_TYPE_AZURE_APP_INSIGHTS, LowcodeEvent, START_CONNECTOR_ADD_INSIGHTS } from "../../../../models";
import { APIHeightStates } from "../../../LowCodeDiagram/Components/DialogBoxes/PlusHolder/PlusElements";
import { PlusViewState } from "../../../LowCodeDiagram/ViewState/plus";
import { getConnectorIconSVG } from "../../../Portals/utils";
import { wizardStyles as useFormStyles} from "../../ConfigForms/style";
import { ButtonWithIcon } from "../../FormFieldComponents/Button/ButtonWithIcon";

import FilterByMenu from "./FilterByMenu";
import SearchBar from "./SearchBar";
import useStyles from "./style";

export interface MarketplaceProps {
    onSelect: (balModule: BallerinaModule, selectedBalModule: LocalVarDecl) => void;
    onChange?: (type: string, subType: string, balModule?: BallerinaModule) => void;
    viewState?: PlusViewState;
    collapsed?: (value: APIHeightStates) => void;
    balModuleType: BallerinaModuleType;
    fetchModulesList: (searchQuery: string, selectedCategory: string, connectorLimit: number, currentFilePath: string,
                       filterState: FilterStateMap, userInfo: UserState, page?: number) => Promise<BallerinaModuleResponse>;
    title: string;
    shortName?: string;
}

export interface FilterStateMap {
    [key: string]: boolean;
}

export enum BallerinaModuleType {
    Trigger,
    Connector
}

export function Marketplace(props: MarketplaceProps) {
    const classes = useStyles();
    const formClasses = useFormStyles();
    const {
        props: { currentFile, userInfo },
        api: {
            helpPanel: { openConnectorHelp },
            insights: { onEvent },
        },
    } = useContext(Context);

    const [centralModules, setCentralModules] = useState<BallerinaModule[]>([]);
    const [localModules, setLocalModules] = useState<BallerinaModule[]>([]);
    const [isSearchResultsFetching, setIsSearchResultsFetching] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [filterState, setFilterState] = useState<FilterStateMap>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [isNextPageFetching, setIsNextPageFetching] = useState(false);

    const connectorLimit = 14;

    const shortName = props.shortName ? props.shortName : props.title;

    React.useEffect(() => {
        fetchModulesList();
    }, [searchQuery, selectedCategory, filterState]);

    let centralModuleComponents: ReactNode[] = [];
    let localModuleComponents: ReactNode[] = [];

    const onSelectModule = (balModule: BallerinaModule) => {
        const event: LowcodeEvent = {
            type: EVENT_TYPE_AZURE_APP_INSIGHTS,
            name: START_CONNECTOR_ADD_INSIGHTS,
            property: balModule.displayName || balModule.package.name,
        };
        onEvent(event);
        props.onSelect(balModule, undefined);
        openConnectorHelp(balModule);
    };

    const getModuleComponents = (balModules: BallerinaModule[]): ReactNode[] => {
        const componentList: ReactNode[] = [];
        balModules?.forEach((module: BallerinaModule) => {
            const moduleName = (module.displayAnnotation?.label || `${module.package?.name} / ${module.name}`).replace(/["']/g, "");
            const component: ReactNode = (
                <Grid item={true} sm={6} alignItems="center">
                    <div key={moduleName} onClick={onSelectModule.bind(this, module)} data-testid={moduleName.toLowerCase()}>
                        <div className={classes.balModule}>
                            <div>{getConnectorIconSVG(module)}</div>
                            <div className={classes.balModuleName}>{moduleName}</div>
                            <div className={classes.orgName}>by {module.package.organization}</div>
                        </div>
                    </div>
                </Grid>
            );
            componentList.push(component);
        });
        return componentList;
    };

    const fetchModulesList = async (page?: number) => {
        page ? setIsNextPageFetching(true) : setIsSearchResultsFetching(true);
        const response: BallerinaModuleResponse = await props.fetchModulesList(searchQuery, selectedCategory, connectorLimit, currentFile.path, filterState, userInfo, page);
        if (response.central?.length > 0) {
            page ? setCentralModules([...centralModules, ...response.central]) : setCentralModules(response.central);
        }
        if (response.local?.length > 0) {
            setLocalModules(response.local);
        }
        page ? setIsNextPageFetching(false) : setIsSearchResultsFetching(false);
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
            fetchModulesList(currentPage + 1);
            setCurrentPage(currentPage + 1);
        }
    };

    if (!isSearchResultsFetching) {
        centralModuleComponents = getModuleComponents(centralModules);
        localModuleComponents = getModuleComponents(localModules);
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
                                        <FormattedMessage id="lowcode.develop.configForms.connectorList.title" defaultMessage={props.title} />
                                    </Box>
                                </Typography>
                            </div>
                        </div>

                        <div onWheel={preventDiagramScrolling} className={classes.container}>
                            <SearchBar searchQuery={searchQuery} onSearchButtonClick={onSearchButtonClick} type={shortName}/>
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
                                        <Grid sm={12} item={true} container={true} alignItems="center" className={classes.filterTagWrap}>
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
                                        alignContent="flex-start"
                                        spacing={2}
                                        className={classes.balModuleListWrap}
                                        onScroll={handleConnectorListScroll}
                                    >
                                        {!isSearchResultsFetching && localModules?.length > 0 && (
                                            <>
                                                <Grid item={true} sm={12} className={classes.balModuleSectionWrap}>
                                                    <Grid item={true} sm={6} md={6} lg={6}>
                                                        <Typography variant="h4">Local {shortName}</Typography>
                                                    </Grid>
                                                </Grid>
                                                {localModuleComponents}
                                            </>
                                        )}
                                        {!isSearchResultsFetching && centralModules?.length > 0 && (
                                            <>
                                                <Grid item={true} sm={12} className={classes.balModuleSectionWrap}>
                                                    <Grid item={true} sm={6} md={6} lg={6}>
                                                        <Typography variant="h4">Public {shortName}</Typography>
                                                    </Grid>
                                                </Grid>
                                                {centralModuleComponents}
                                            </>
                                        )}
                                        {!isSearchResultsFetching && isNextPageFetching && (
                                            <Grid item={true} sm={12} className={classes.balModuleSectionWrap}>
                                                <Box display="flex" justifyContent="center">
                                                    <Typography variant="body1">Loading more {shortName}...</Typography>
                                                </Box>
                                            </Grid>
                                        )}
                                    </Grid>

                                    {!isSearchResultsFetching && centralModuleComponents.length === 0 && localModules.length === 0 && (
                                        <Grid sm={12} item={true} container={true} alignItems="center" className={classes.msgContainer}>
                                            <Grid item={true} sm={12}>
                                                <Box display="flex" justifyContent="center">
                                                    <Typography variant="body1">No {shortName} found.</Typography>
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
