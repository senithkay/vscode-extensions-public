/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */
// tslint:disable: jsx-no-multiline-js

// TODO: Move this component to a common repo.

import React, { ReactNode, SyntheticEvent, useRef, useState } from "react";

import { Box, CircularProgress, FormControl, Grid, Typography } from "@material-ui/core";
import { CloseRounded } from "@material-ui/icons";
import { Button, IconButton } from "@mui/material";
import { BallerinaConstruct, BallerinaModuleResponse } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import FilterByMenu from "./FilterByMenu";
import ModuleCard from "./ModuleCard";
import SearchBar from "./SearchBar";
import useStyles from "./style";
import { FilterIcon } from "./icons";

export interface MarketplaceProps {
    onSelect: (balModule: BallerinaConstruct) => void;
    onCancel?: () => void;
    onChange?: (type: string, subType: string, balModule?: BallerinaConstruct) => void;
    balModuleType: BallerinaModuleType;
    fetchModulesList: (queryParams: SearchQueryParams) => Promise<BallerinaModuleResponse>;
    title: string;
    shortName?: string;
}

export interface SearchQueryParams {
    query: string;
    category?: string;
    filterState?: FilterStateMap;
    page?: number;
    limit?: number;
}

export interface FilterStateMap {
    [key: string]: boolean;
}

export enum BallerinaModuleType {
    Trigger,
    Connector,
}

export function Marketplace(props: MarketplaceProps) {
    const classes = useStyles();
    const { onSelect, title } = props;

    const [isSearchResultsFetching, setIsSearchResultsFetching] = useState(true);
    const [isNextPageFetching, setIsNextPageFetching] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [filterState, setFilterState] = useState<FilterStateMap>({});
    const [showFilters, setShowFilters] = useState(false);
    const [selectedModule, setSelectedModule] = useState<BallerinaConstruct>();

    const currentPage = useRef(1);
    const fetchCount = useRef(0);
    const isLastPage = useRef(false);
    const centralModules = useRef(new Map<string, BallerinaConstruct>());
    const localModules = useRef(new Map<string, BallerinaConstruct>());

    const pageLimit = 18;
    const shortName = props.shortName || title;

    React.useEffect(() => {
        fetchModulesList();
        trackFilterChange();
        setSelectedModule(undefined);
        onSelect(undefined);
    }, [searchQuery, selectedCategory]);

    let centralModuleComponents: ReactNode[] = [];
    let localModuleComponents: ReactNode[] = [];

    const onSelectModule = (balModule: BallerinaConstruct) => {
        trackItemSelect(balModule);
        setSelectedModule(balModule);
        onSelect(balModule);
    };

    const getModuleComponents = (balModules: Map<string, BallerinaConstruct>): ReactNode[] => {
        const componentList: ReactNode[] = [];
        balModules?.forEach((module: BallerinaConstruct, key: string) => {
            const component = (
                <ModuleCard key={key} module={module} onSelectModule={onSelectModule} selected={selectedModule} columns={showFilters ? 2 : 3} />
            );
            componentList.push(component);
        });
        return componentList;
    };

    const fetchModulesList = async (page?: number) => {
        if (page) {
            setIsNextPageFetching(true);
        } else {
            // Keep track of fetch request count to show/hide preloader
            fetchCount.current = fetchCount.current + 1;
            isLastPage.current = false;
            setIsSearchResultsFetching(true);
        }

        const queryParams: SearchQueryParams = {
            query: searchQuery,
            category: selectedCategory,
            filterState,
            limit: pageLimit,
            page,
        };
        const response: BallerinaModuleResponse = await props.fetchModulesList(queryParams);
        localModules.current.clear();
        response.local?.forEach((module) => {
            localModules.current.set(module.package?.name || module.name, module);
        });
        if (!page) {
            centralModules.current.clear();
            response.central?.forEach((module) => {
                if (module.id && haveConstruct(module)) {
                    centralModules.current.set(module.id, module);
                }
            });
        } else if (response.central?.length > 0) {
            response.central.forEach((module) => {
                if (module.id && haveConstruct(module)) {
                    centralModules.current.set(module.id, module);
                }
            });
        } else {
            isLastPage.current = true;
        }

        if (page) {
            setIsNextPageFetching(false);
        } else {
            fetchCount.current = fetchCount.current > 0 ? fetchCount.current - 1 : 0;
            // Hide preloader only all fetch request are finished
            if (fetchCount.current === 0) {
                setIsSearchResultsFetching(false);
            }
        }
    };

    const haveConstruct = (module: BallerinaConstruct): boolean => {
        return !(module.name === "Caller");
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

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const handleModulesListScroll = (e: React.UIEvent<HTMLElement>) => {
        const bottom = Math.floor(e.currentTarget.scrollHeight - e.currentTarget.scrollTop) <= e.currentTarget.clientHeight;
        if (!isLastPage.current && bottom && !isSearchResultsFetching) {
            currentPage.current = currentPage.current + 1;
            fetchModulesList(currentPage.current);
        }
    };

    const trackItemSelect = (balModule: BallerinaConstruct) => {
        const customDimensions: any = {
            organization: balModule?.package?.organization,
            connectorName: balModule?.package?.name,
            version: balModule?.package?.version,
            // queryFilterBy needs to added once properly implemented
        };
        if (selectedCategory) {
            customDimensions.queryCategory = selectedCategory;
            const [mainCategory, subCategory] = selectedCategory.split("/");
            customDimensions.mainCategory = mainCategory;
            if (subCategory) {
                customDimensions.subCategory = subCategory;
            }
        }
        if (searchQuery) {
            customDimensions.querySearch = searchQuery;
        }
    };

    const trackFilterChange = () => {
        if (selectedCategory || searchQuery) {
            const customDimensions: any = {};
            if (selectedCategory) {
                customDimensions.queryCategory = selectedCategory;
                const [mainCategory, subCategory] = selectedCategory.split("/");
                customDimensions.mainCategory = mainCategory;
                if (subCategory) {
                    customDimensions.subCategory = subCategory;
                }
            }
            if (searchQuery) {
                customDimensions.querySearch = searchQuery;
            }
        }
    };

    if (!isSearchResultsFetching) {
        centralModuleComponents = getModuleComponents(centralModules.current);
        localModuleComponents = getModuleComponents(localModules.current);
    }

    const renderModulesList = (modules: ReactNode[]): ReactNode => {
        return (
            <>
                {/* {shortName !== "Triggers" ? (
                    <Grid item={true} xs={12} className={classes.balModuleSectionWrap}>
                        <Grid item={true} xs={6}>
                            <Typography variant="h4">{modulesListTitle}</Typography>
                        </Grid>
                    </Grid>
                ) : null} */}
                {modules}
            </>
        );
    };

    const loadingScreen = (
        <Grid sm={12} item={true} container={true} className={classes.msgContainer}>
            <Grid item={true} sm={12}>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <CircularProgress data-testid="marketplace-search-loader" />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Typography variant="body1">Loading {shortName}...</Typography>
                </Box>
            </Grid>
        </Grid>
    );

    const notFoundComponent = (
        <Grid sm={12} item={true} container={true} className={classes.msgContainer}>
            <Grid item={true} sm={12}>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Typography variant="body1">No {shortName.toLocaleLowerCase()} found.</Typography>
                </Box>
            </Grid>
        </Grid>
    );

    const modulesList = (
        <Grid
            item={true}
            xs={12}
            container={true}
            direction="row"
            justifyContent="flex-start"
            alignContent="flex-start"
            spacing={2}
            className={classes.balModuleListWrap}
            onScroll={handleModulesListScroll}
        >
            {localModules.current.size > 0 && renderModulesList(localModuleComponents)}
            {centralModules.current.size > 0 && renderModulesList(centralModuleComponents)}
            {isNextPageFetching && (
                <Grid item={true} sm={12} className={classes.balModuleSectionWrap}>
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <CircularProgress data-testid="marketplace-next-page-loader" size={20} />
                        <Typography variant="body1" className={classes.pageLoadingText}>
                            Loading more {shortName}...
                        </Typography>
                    </Box>
                </Grid>
            )}
        </Grid>
    );

    const searchBar = <SearchBar searchQuery={searchQuery} onSearch={onSearchButtonClick} type={shortName} />;

    const selectedCategoriesChips = (
        <Grid sm={12} item={true} container={true} className={classes.filterTagWrap}>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", className: classes.filterTag }}>
                <Typography variant="body1">{selectedCategory}</Typography>
                <IconButton className={classes.filterRemoveBtn} onClick={clearCategory}>
                    <CloseRounded fontSize="small" />
                </IconButton>
            </Box>
        </Grid>
    );

    const leftSidePanel = (
        <Grid item={true} sm={4}>
            <FilterByMenu
                filterState={filterState}
                setFilterState={setFilterState}
                filterValues={[]}
                selectedCategory={selectedCategory}
                setCategory={updateCategory}
            />
        </Grid>
    );

    return (
        <FormControl data-testid="log-form" className={classes.container}>
            <div id="module-list-container" className={classes.formWrapper} onWheel={preventDiagramScrolling}>
                <Grid item={true} xs={12} container={true}>
                    <Grid item={true} xs={4} container={true}>
                        <Button onClick={toggleFilters} className={classes.filterBtn} startIcon={<FilterIcon filled={showFilters} />} disableRipple>
                            {showFilters ? "Hide Filters" : "Filters"}
                        </Button>
                    </Grid>
                    <Grid item={true} xs={8} container={true}>
                        {searchBar}
                    </Grid>
                </Grid>
                <Grid item={true} sm={12} container={true}>
                    {showFilters && leftSidePanel}
                    <Grid container={true} item={true} sm={showFilters ? 8 : 12} className={classes.resultsContainer}>
                        {isSearchResultsFetching && loadingScreen}

                        {!isSearchResultsFetching && selectedCategory !== "" && selectedCategoriesChips}
                        {!isSearchResultsFetching && (centralModules.current.size > 0 || localModules.current.size > 0) && modulesList}

                        {!isSearchResultsFetching && centralModules.current.size === 0 && localModules.current.size === 0 && notFoundComponent}
                    </Grid>
                </Grid>
            </div>
        </FormControl>
    );
}
