/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { ReactNode, SyntheticEvent, useContext, useRef, useState } from "react";


import { PanelContainer } from "@wso2-enterprise/ballerina-side-panel";
import { useVisualizerContext } from '../../../Context';
import { Card, Grid, GridItem, ProgressRing, Typography } from '@wso2-enterprise/ui-toolkit';
// import { CloseRounded } from "@material-ui/icons";
// import {
//     BallerinaConstruct,
//     BallerinaModuleResponse,
//     DiagramEditorLangClientInterface,
//     LOAD_CONNECTOR_LIST,
//     LowcodeEvent,
//     SEARCH_CONNECTOR,
//     SELECT_CONNECTOR
// } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
// import {
//     ButtonWithIcon,
//     IconBtnWithText
// } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { LocalVarDecl } from "@wso2-enterprise/syntax-tree";

// import { FilterIcon } from "../../../../../assets/icons";
// import { Context } from "../../../../../Contexts/Diagram";
// import { UserState } from "../../../../../types";
// import { wizardStyles as useFormStyles } from "../style";

// import FilterByMenu from "./FilterByMenu";
import ModuleCard from "./ModuleCard";
// import SearchBar from "./SearchBar";
import useStyles from "./style";
import { BallerinaRpcClient, useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { BallerinaConstruct, BallerinaModuleResponse } from "@wso2-enterprise/ballerina-core";

export interface MarketplaceProps {
    currentFilePath: string;
    onSelect: (balModule: BallerinaConstruct, rpcClient: BallerinaRpcClient, selectedBalModule?: LocalVarDecl) => void;
    onClose: () => void;
    fetchModulesList: (
        queryParams: SearchQueryParams,
        currentFilePath: string,
        langClient: BallerinaRpcClient
    ) => Promise<BallerinaModuleResponse>;
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
    const { setActivePanel } = useVisualizerContext();
    const { rpcClient } = useRpcContext();
 
    
    
    
    const classes = useStyles();
    // const formClasses = useFormStyles();
    const { onSelect, title, currentFilePath, onClose } = props;
    // const {
    //     props: { currentFile, userInfo },
    //     api: {
    //         // helpPanel: { openConnectorHelp },
    //         ls: { getDiagramEditorLangClient },
    //         insights: { onEvent },
    //     },
    // } = useContext(Context);

    const [isSearchResultsFetching, setIsSearchResultsFetching] = useState(true);
    const [isNextPageFetching, setIsNextPageFetching] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [filterState, setFilterState] = useState<FilterStateMap>({});
    const [showFilters, setShowFilters] = useState(false);

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
    }, [searchQuery, selectedCategory]);

    let centralModuleComponents: ReactNode[] = [];
    let localModuleComponents: ReactNode[] = [];

    const onSelectModule = (balModule: BallerinaConstruct) => {
        trackItemSelect(balModule);
        console.log("balModule", balModule);
        onSelect(balModule, rpcClient, undefined);
        // openConnectorHelp(balModule);
    };

    const getModuleComponents = (balModules: Map<string, BallerinaConstruct>): ReactNode[] => {
        const componentList: ReactNode[] = [];
        balModules?.forEach((module: BallerinaConstruct, key: string) => {
            const component = (
                <ModuleCard key={key} module={module} onSelectModule={onSelectModule} columns={3} />
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
        // const langClient = await getDiagramEditorLangClient();
        // const connectorWizardClient = rpcClient.getConnectorWizardRpcClient();
        const response: BallerinaModuleResponse = await props.fetchModulesList(queryParams, currentFilePath,
            rpcClient);
        localModules.current.clear();
        response.local?.forEach((module) => {
            localModules.current.set((module.package?.name || module.name), module);
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
        if (query && query.length >= 3) {
            // const event: LowcodeEvent = {
            //     type: SEARCH_CONNECTOR,
            //     connectorName: query
            // };
            // onEvent(event);
        }
    };

    // const updateCategory = (category: string) => {
    //     setSelectedCategory(category);
    // };

    // const clearCategory = () => {
    //     setSelectedCategory("");
    // };

    // const toggleFilters = () => {
    //     setShowFilters(!showFilters);
    // };

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
        }
        if (selectedCategory) {
            customDimensions.queryCategory = selectedCategory;
            const [mainCategory, subCategory] = selectedCategory.split('/');
            customDimensions.mainCategory = mainCategory;
            if (subCategory) {
                customDimensions.subCategory = subCategory;
            }
        }
        if (searchQuery) {
            customDimensions.querySearch = searchQuery;
        }
        // const event: LowcodeEvent = {
        //     type: SELECT_CONNECTOR,
        //     property: customDimensions
        // };
        // onEvent(event);
    }

    const trackFilterChange = () => {
        if (selectedCategory || searchQuery) {
            const customDimensions: any = {}
            if (selectedCategory) {
                customDimensions.queryCategory = selectedCategory;
                const [mainCategory, subCategory] = selectedCategory.split('/');
                customDimensions.mainCategory = mainCategory;
                if (subCategory) {
                    customDimensions.subCategory = subCategory;
                }
            }
            if (searchQuery) {
                customDimensions.querySearch = searchQuery;
            }
            // const event: LowcodeEvent = {
            //     type: LOAD_CONNECTOR_LIST,
            //     property: customDimensions
            // };
            // onEvent(event);
        }
    }

    if (!isSearchResultsFetching) {
        centralModuleComponents = getModuleComponents(centralModules.current);
        localModuleComponents = getModuleComponents(localModules.current);
    }

    const renderModulesList = (modulesListTitle: string, modules: ReactNode[]): ReactNode => {
        return (
            <>
                {shortName !== "Triggers" ? (
                            <Typography variant="h4">{modulesListTitle}</Typography>
                ) : null}
                 <div id="module-list-container"  style={{overflowY: 'scroll',padding: '15px 20px', height: '80vh', display: 'flex', width: '100%'}}>
                <Grid columns={3} >
                    {modules}
                </Grid>
                </div>
            </>
        );
    };

    const loadingScreen = (
            <>
                <div>
                    <ProgressRing data-testid="marketplace-search-loader" />
                </div>
                <div>
                    <Typography variant="body1">Loading {shortName}...</Typography>
                </div>
                </>

    );

    const notFoundComponent = (

                <div>
                    <Typography variant="body1">No {shortName.toLocaleLowerCase()} found.</Typography>
                </div>
        

    );

    const modulesList = (
        <div style={{padding: "10px"}}>
      
            {localModules.current.size > 0 && renderModulesList("Local " + shortName, localModuleComponents)}
            {centralModules.current.size > 0 && renderModulesList("Public " + shortName, centralModuleComponents)}
            {isNextPageFetching && (
                    <div>
                        <ProgressRing data-testid="marketplace-next-page-loader" />
                        <Typography variant="body1" className={classes.pageLoadingText}>¬
                            Loading more {shortName}...
                        </Typography>
                    </div>
            )}
        </div>
    );

    // const searchBar = <SearchBar searchQuery={searchQuery} onSearch={onSearchButtonClick} type={shortName} />;

    // const selectedCategoriesChips = (
    //     <Grid columns={12} className={classes.filterTagWrap}>
    //         <div className={classes.filterTag}>
    //             <Typography variant="body1">{selectedCategory}</Typography>
    //             <ButtonWithIcon
    //                 className={classes.filterRemoveBtn}
    //                 onClick={clearCategory}
    //                 icon={<CloseRounded fontSize="small" />}
    //             />
    //         </div>
    //     </Grid>
    // );

    // const leftSidePanel = (
    //     <Grid columns={4}>
    //         <FilterByMenu
    //             filterState={filterState}
    //             setFilterState={setFilterState}
    //             filterValues={[]}
    //             selectedCategory={selectedCategory}
    //             setCategory={updateCategory}
    //         />
    //     </Grid>
    // );

    // return (
    //     <PanelContainer title="Connectors" show={true} onClose={() => { setActivePanel({ isActive: false }) }}>
    //         <div id="module-list-container"  style={{width: '100%',
    //         flexDirection: "row",
    //         padding: '15px 20px',}} onWheel={preventDiagramScrolling}>
    //             <Grid columns={12}>
    //                 {/* <Grid columns={4}>
    //                     <IconBtnWithText
    //                         onClick={toggleFilters}
    //                         className={classes.filterBtn}
    //                         text={showFilters ? "Hide Filters" : "Filters"}
    //                         icon={<FilterIcon filled={showFilters} />}
    //                     />
    //                 </Grid> */}
    //                 {/* <Grid columns={8}>
    //                     {searchBar}
    //                 </Grid> */}
    //             </Grid>
    //             <Grid columns={12}>
    //                 {/* {showFilters && leftSidePanel} */}
    //                 <Grid columns={showFilters ? 8 : 12} className={classes.resultsContainer}>
    //                     {isSearchResultsFetching && loadingScreen}

    //                     {/* {!isSearchResultsFetching && selectedCategory !== "" && selectedCategoriesChips} */}
    //                     {!isSearchResultsFetching &&
    //                         (centralModules.current.size > 0 || localModules.current.size > 0) &&
    //                         modulesList}

    //                     {!isSearchResultsFetching &&
    //                         centralModules.current.size === 0 &&
    //                         localModules.current.size === 0 &&
    //                         notFoundComponent}
    //                 </Grid>
    //             </Grid>
    //         </div>
    //     </PanelContainer>
    // );

    return (
        <PanelContainer title="Connectors" show={true} width={'500px'} onClose={onClose}>
           
                {/* <Grid columns={3}  className={classes.resultsContainer}> */}
                        {/* {isSearchResultsFetching && loadingScreen} */}

                        {/* {!isSearchResultsFetching && selectedCategory !== "" && selectedCategoriesChips} */}
                        {!isSearchResultsFetching &&
                            (centralModules.current.size > 0 || localModules.current.size > 0) &&
                            modulesList}

                        {/* {!isSearchResultsFetching &&
                            centralModules.current.size === 0 &&
                            localModules.current.size === 0 &&
                            notFoundComponent} */}
                {/* </Grid> */}
            {/* </div> */}
        </PanelContainer>
    );
}
