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

import { Box, CircularProgress, FormControl, Grid, Typography } from "@material-ui/core";
import { CloseRounded } from "@material-ui/icons";
import { BallerinaModule, BallerinaModuleResponse, ButtonWithIcon, FormHeaderSection } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { LocalVarDecl } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../Contexts/Diagram";
import { UserState } from "../../../../../types";
import { EVENT_TYPE_AZURE_APP_INSIGHTS, LowcodeEvent, START_CONNECTOR_ADD_INSIGHTS } from "../../../../models";
import { APIHeightStates } from "../../../LowCodeDiagram/Components/DialogBoxes/PlusHolder/PlusElements";
import { PlusViewState } from "../../../LowCodeDiagram/ViewState/plus";
import { wizardStyles as useFormStyles} from "../style";

import FilterByMenu from "./FilterByMenu";
import ModuleCard from "./ModuleCard";
import SearchBar from "./SearchBar";
import useStyles from "./style";

export interface MarketplaceProps {
    onSelect: (balModule: BallerinaModule, selectedBalModule: LocalVarDecl) => void;
    onCancel?: () => void;
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
    const {onSelect, onCancel, title} = props;
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

    const shortName = props.shortName || title;

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
        onSelect(balModule, undefined);
        openConnectorHelp(balModule);
    };

    const getModuleComponents = (balModules: BallerinaModule[]): ReactNode[] => {
        const componentList: ReactNode[] = [];
        balModules?.forEach((module: BallerinaModule) => {
            const component = <ModuleCard module={module} onSelectModule={onSelectModule}/>;
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

    const handleModulesListScroll = (e: React.UIEvent<HTMLElement>) => {
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

    const renderModulesList = (modulesListTitle: string, modules: ReactNode[]): ReactNode => {
        return (
            <>
                <Grid item={true} sm={12} className={classes.balModuleSectionWrap}>
                    <Grid item={true} sm={6} md={6} lg={6}>
                        <Typography variant="h4">{modulesListTitle}</Typography>
                    </Grid>
                </Grid>
                {modules}
            </>
        );
    }
    ;

    // const title = (
    //     <div className={formClasses.formTitleWrapper}>
    //         <div className={formClasses.mainTitleWrapper}>
    //             <Typography variant="h4">
    //                 <Box paddingTop={2} paddingBottom={2}>
    //                     <FormattedMessage id="lowcode.develop.configForms.connectorList.title" defaultMessage={props.title} />
    //                 </Box>
    //             </Typography>
    //         </div>
    //     </div>
    // );

    const loadingScreen = (
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
    );

    const modulesList = (
        <Grid
            item={true}
            sm={12}
            container={true}
            direction="row"
            justifyContent="flex-start"
            alignContent="flex-start"
            spacing={2}
            className={classes.balModuleListWrap}
            onScroll={handleModulesListScroll}
        >
            {!isSearchResultsFetching && localModules?.length > 0 && (
                renderModulesList("Local " + shortName, localModuleComponents)
            )}
            {!isSearchResultsFetching && centralModules?.length > 0 && (
                renderModulesList("Public " + shortName, centralModuleComponents)
            )}
            {!isSearchResultsFetching && isNextPageFetching && (
                <Grid item={true} sm={12} className={classes.balModuleSectionWrap}>
                    <Box display="flex" justifyContent="center">
                        <Typography variant="body1">Loading more {shortName}...</Typography>
                    </Box>
                </Grid>
            )}
        </Grid>
    );

    const notFoundComponent = (
        <Grid sm={12} item={true} container={true} alignItems="center" className={classes.msgContainer}>
            <Grid item={true} sm={12}>
                <Box display="flex" justifyContent="center">
                    <Typography variant="body1">No {shortName} found.</Typography>
                </Box>
            </Grid>
        </Grid>
    );

    const selectedCategoriesChips = (
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
    );

    const leftSidePanel = (
        <Grid item={true} sm={5}>
            <FilterByMenu
                filterState={filterState}
                setFilterState={setFilterState}
                filterValues={[]}
                selectedCategory={selectedCategory}
                setCategory={updateCategory}
            />
        </Grid>
    );

    const searchBar = (
        <SearchBar searchQuery={searchQuery} onSearchButtonClick={onSearchButtonClick} type={shortName} />
    );

    return (
        <FormControl data-testid="log-form" className={classes.container}>
            <FormHeaderSection
                onCancel={onCancel}
                statementEditor={false}
                formTitle={`lowcode.develop.configForms.${shortName.replaceAll(" ", "")}.title`}
                defaultMessage={title}
                toggleChecked={false}
            />
            <div className={formClasses.formWrapper}>
                <div className={formClasses.formFeilds}>
                    <div onWheel={preventDiagramScrolling} className={classes.container}>
                        {searchBar}
                        <Grid item={true} sm={12} container={true}>
                            {leftSidePanel}
                            <Grid sm={7} container={true} item={true} className={classes.resultsContainer}>
                                {isSearchResultsFetching && loadingScreen}
                                {!isSearchResultsFetching && selectedCategory !== "" && selectedCategoriesChips}
                                {modulesList}
                                {!isSearchResultsFetching &&
                                    centralModuleComponents.length === 0 &&
                                    localModules.length === 0 &&
                                    notFoundComponent}
                            </Grid>
                        </Grid>
                    </div>
                </div>
            </div>
        </FormControl>
    );
}
