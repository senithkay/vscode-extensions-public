/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-multiline-js jsx-no-lambda
import React, { useContext, useEffect, useMemo, useState } from "react";

import {
    Box,
    CircularProgress, FormControl,
    Grid,
    IconButton,
    Input,
    InputAdornment,
    Typography
} from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import {
    LibraryDataResponse,
    LibraryKind,
    LibrarySearchResponse
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import debounce from "lodash.debounce";

import LibraryModuleIcon from "../../assets/icons/LibraryModuleIcon";
import LibrarySearchIcon from "../../assets/icons/LibrarySearchIcon";
import { LANG_LIBS_IDENTIFIER, STD_LIBS_IDENTIFIER } from "../../constants";
import { StatementEditorContext } from "../../store/statement-editor-context";
import { useStatementEditorStyles, useStmtEditorHelperPanelStyles } from "../styles";

import { LibrariesList } from "./LibrariesList";
import { SearchResult } from "./SearchResult";
import { filterByKeyword } from "./utils";

interface LibraryBrowserProps {
    libraryType: string;
}

enum LibraryBrowserMode {
    LIB_LIST = 'libraries_list',
    LIB_SEARCH = 'libraries_search',
    LIB_BROWSE = 'library_browse',
}

const DEFAULT_SEARCH_SCOPE = "distribution";

export function LibraryBrowser(props: LibraryBrowserProps) {
    const { libraryType } = props;
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();
    const statementEditorClasses = useStatementEditorStyles();
    const {
        library: {
            getLibrariesList,
            getLibrariesData
        }
    } = useContext(StatementEditorContext);

    const [libraryBrowserMode, setLibraryBrowserMode] = useState(LibraryBrowserMode.LIB_LIST);
    const [searchScope, setSearchScope] = useState(DEFAULT_SEARCH_SCOPE);
    const [librariesSearchData, setLibrariesSearchData] = useState<LibrarySearchResponse>();
    const [libraries, setLibraries] = useState([]);
    const [filteredSearchData, setFilteredSearchData] = useState<LibrarySearchResponse>();
    const [libraryData, setLibraryData] = useState<LibraryDataResponse>();
    const [moduleTitle, setModuleTitle] = useState('');
    const [moduleSelected, setModuleSelected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        (async () => {
            const response = await getLibrariesData();
            if (response) {
                setLibrariesSearchData(response);
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            libraryDataFetchingHandler(true);
            let response;
            if (libraryType === LANG_LIBS_IDENTIFIER) {
                response = await getLibrariesList(LibraryKind.langLib);
            } else if (libraryType === STD_LIBS_IDENTIFIER) {
                response = await getLibrariesList(LibraryKind.stdLib);
            } else {
                response = await getLibrariesList();
            }

            if (response) {
                setLibraries(response.librariesList);
            }

            setLibraryBrowserMode(LibraryBrowserMode.LIB_LIST);
            setSearchScope(DEFAULT_SEARCH_SCOPE);
            setModuleTitle('');
            setModuleSelected(false);
            resetKeyword();
            libraryDataFetchingHandler(false);
        })();
    }, [libraryType]);

    const libraryBrowsingHandler = (data: LibraryDataResponse) => {
        setLibraryData(data);
        setLibraryBrowserMode(LibraryBrowserMode.LIB_BROWSE);
        setSearchScope(data.searchData.modules[0].id);
        setModuleTitle(data.searchData.modules[0].id);
        setModuleSelected(true);
        resetKeyword();
    };

    const onClickOnReturnIcon = async () => {
        setLibraryBrowserMode(LibraryBrowserMode.LIB_LIST);
        setSearchScope(DEFAULT_SEARCH_SCOPE);
        setModuleTitle('');
        setModuleSelected(false);
        resetKeyword();
    }

    const isEmptyFilteredList = useMemo(() => {
        if (filteredSearchData){
            return !Object.values(filteredSearchData).some(it => it.length > 0);
        }
    }, [filteredSearchData]);

    const libraryDataFetchingHandler = (isFetching: boolean) => {
        setIsLoading(isFetching);
    }

    const resetKeyword = () => {
        const searchInput = (document.getElementById("searchKeyword") as HTMLInputElement);
        searchInput.value = '';
    }

    const loadingScreen = (
        <Grid sm={12} item={true} container={true} className={stmtEditorHelperClasses.loadingContainer}>
            <Grid item={true} sm={12}>
                <Box display="flex" justifyContent="center">
                    <CircularProgress />
                </Box>
                <Box display="flex" justifyContent="center" mt={2}>
                    <Typography variant="body1">Loading...</Typography>
                </Box>
            </Grid>
        </Grid>
    );

    const searchLibrary = (event: React.ChangeEvent<HTMLInputElement>) => {
        libraryDataFetchingHandler(true)
        const searchValue: string = event.target.value;

        if (searchValue === '' && !moduleSelected) {
            setLibraryBrowserMode(LibraryBrowserMode.LIB_LIST);
            setSearchScope(DEFAULT_SEARCH_SCOPE);
        } else {
            let filteredData;
            if (librariesSearchData && searchScope === DEFAULT_SEARCH_SCOPE) {
                filteredData = filterByKeyword(librariesSearchData, searchValue);
            } else if (libraryData && searchScope !== DEFAULT_SEARCH_SCOPE) {
                filteredData = filterByKeyword(libraryData.searchData, searchValue);
            }
            setLibraryBrowserMode(LibraryBrowserMode.LIB_SEARCH);
            setFilteredSearchData(filteredData);
        }

        libraryDataFetchingHandler(false);
    }

    const debounceLibrarySearch = debounce(searchLibrary, 500);

    return (
        <div className={stmtEditorHelperClasses.libraryBrowser}>
            <div className={stmtEditorHelperClasses.libraryBrowserHeader}>
                {(libraryBrowserMode !== LibraryBrowserMode.LIB_LIST || searchScope !== DEFAULT_SEARCH_SCOPE) && (
                    <>
                        <IconButton onClick={onClickOnReturnIcon} className={stmtEditorHelperClasses.libraryReturnIcon}>
                            <ArrowBack className={stmtEditorHelperClasses.arrowBack} />
                        </IconButton>
                        {moduleTitle && (
                            <>
                                <div className={stmtEditorHelperClasses.libraryModuleIcon}>
                                    <LibraryModuleIcon/>
                                </div>
                                <div className={stmtEditorHelperClasses.moduleTitle}>{moduleTitle}</div>
                            </>
                        )}
                    </>
                )}
                <FormControl style={{ width: 'inherit' }}>
                    <Input
                        id={"searchKeyword"}
                        className={stmtEditorHelperClasses.librarySearchBox}
                        autoFocus={true}
                        placeholder={`search in ${searchScope}`}
                        onChange={debounceLibrarySearch}
                        endAdornment={(
                            <InputAdornment position={"end"} style={{ padding: '8.5px' }}>
                                <LibrarySearchIcon />
                            </InputAdornment>
                        )}
                    />
                </FormControl>
            </div>
            {isLoading ? loadingScreen : (
                <>
                    <div className={statementEditorClasses.stmtEditorExpressionWrapper}>
                        {libraryBrowserMode === LibraryBrowserMode.LIB_LIST && !moduleTitle && (
                            <LibrariesList
                                libraries={libraries}
                                libraryBrowsingHandler={libraryBrowsingHandler}
                                libraryDataFetchingHandler={libraryDataFetchingHandler}
                            />
                        )}
                        {libraryBrowserMode === LibraryBrowserMode.LIB_BROWSE && (
                            <SearchResult
                                librarySearchResponse={libraryData.searchData}
                                moduleSelected={moduleSelected}
                                libraryDataFetchingHandler={libraryDataFetchingHandler}
                            />
                        )}
                        {libraryBrowserMode === LibraryBrowserMode.LIB_SEARCH && filteredSearchData &&
                        (isEmptyFilteredList ?
                            (
                                <div className={statementEditorClasses.stmtEditorInnerWrapper}>
                                    <p>No result found for the searched keyword</p>
                                </div>
                            ) :
                            (
                                <SearchResult
                                    librarySearchResponse={filteredSearchData}
                                    libraryBrowsingHandler={libraryBrowsingHandler}
                                    moduleSelected={moduleSelected}
                                    libraryDataFetchingHandler={libraryDataFetchingHandler}
                                />
                            )
                        )}
                    </div>
                </>
            )
            }
        </div >
    );
}
