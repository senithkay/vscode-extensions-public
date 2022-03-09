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
import React, { useContext, useEffect, useState } from "react";

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

import LibraryModuleIcon from "../../assets/icons/LibraryModuleIcon";
import LibrarySearchIcon from "../../assets/icons/LibrarySearchIcon";
import { LANG_LIBS_IDENTIFIER, STD_LIBS_IDENTIFIER } from "../../constants";
import { StatementEditorContext } from "../../store/statement-editor-context";
import { useStatementEditorStyles } from "../styles";

import { LibrariesList } from "./LibrariesList";
import { SearchResult } from "./SearchResult";
import { filterByKeyword } from "./utils";

interface LibraryBrowserProps {
    libraryType: string;
    isLibrary: boolean;
}

enum LibraryBrowserMode {
    LIB_LIST = 'libraries_list',
    LIB_SEARCH = 'libraries_search',
    LIB_BROWSE = 'library_browse',
}

const DEFAULT_SEARCH_SCOPE = "distribution";

export function LibraryBrowser(props: LibraryBrowserProps) {
    const { libraryType, isLibrary } = props;
    const statementEditorClasses = useStatementEditorStyles();
    const stmtCtx = useContext(StatementEditorContext);
    const {
        library: {
            getLibrariesList,
            getLibrariesData
        }
    } = stmtCtx;

    const [libraryBrowserMode, setLibraryBrowserMode] = useState(LibraryBrowserMode.LIB_LIST);
    const [keyword, setKeyword] = useState('');
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
            setKeyword('');
        })();
    }, [libraryType]);

    useEffect(() => {
        if (keyword === '') {
            setLibraryBrowserMode(LibraryBrowserMode.LIB_LIST);
            setSearchScope(DEFAULT_SEARCH_SCOPE);
        } else {
            let filteredData;
            if (librariesSearchData && searchScope === DEFAULT_SEARCH_SCOPE) {
                filteredData = filterByKeyword(librariesSearchData, keyword);
            } else if (libraryData && searchScope !== DEFAULT_SEARCH_SCOPE) {
                filteredData = filterByKeyword(libraryData.searchData, keyword);
            }
            setFilteredSearchData(filteredData);
            setLibraryBrowserMode(LibraryBrowserMode.LIB_SEARCH);
        }
    }, [keyword]);

    const libraryBrowsingHandler = (data: LibraryDataResponse) => {
        setLibraryData(data);
        setLibraryBrowserMode(LibraryBrowserMode.LIB_BROWSE);
        setSearchScope(data.searchData.modules[0].id);
        setModuleTitle(data.searchData.modules[0].id);
        setModuleSelected(true);
    };

    const onClickOnReturnIcon = async () => {
        setLibraryBrowserMode(LibraryBrowserMode.LIB_LIST);
        setSearchScope(DEFAULT_SEARCH_SCOPE);
        setModuleTitle('');
        setModuleSelected(false);
        setKeyword('');
    }

    const libraryDataFetchingHandler = (isFetching: boolean, moduleElement?: string) => {
        setIsLoading(isFetching);
    }

    const loadingScreen = (
        <Grid sm={12} item={true} container={true} className={statementEditorClasses.loadingContainer}>
            <Grid item={true} sm={12}>
                <Box display="flex" justifyContent="center">
                    <CircularProgress/>
                </Box>
                <Box display="flex" justifyContent="center" mt={2}>
                    <Typography variant="body1">Loading...</Typography>
                </Box>
            </Grid>
        </Grid>
    );

    return (
        <>
        { isLibrary && (
            <div className={statementEditorClasses.libraryBrowser}>
                <div className={statementEditorClasses.libraryBrowserHeader}>
                    {(libraryBrowserMode !== LibraryBrowserMode.LIB_LIST || searchScope !== DEFAULT_SEARCH_SCOPE) && (
                        <>
                            <IconButton onClick={onClickOnReturnIcon} className={statementEditorClasses.libraryReturnIcon}>
                                <ArrowBack className={statementEditorClasses.arrowBack}/>
                            </IconButton>
                            {moduleTitle && (
                                <div className={statementEditorClasses.libraryModuleIcon}>
                                    <LibraryModuleIcon/>
                                </div>
                            )}
                            <div className={statementEditorClasses.moduleTitle}>{moduleTitle}</div>
                        </>
                    )}
                    <FormControl style={{width: 'inherit', marginRight: '10px'}}>
                        <Input
                            className={statementEditorClasses.librarySearchBox}
                            value={keyword}
                            placeholder={`search in ${searchScope}`}
                            onChange={(e) => setKeyword(e.target.value)}
                            endAdornment={(
                                <InputAdornment position={"end"} style={{padding: '8.5px'}}>
                                    <LibrarySearchIcon/>
                                </InputAdornment>
                            )}
                        />
                    </FormControl>
                </div>
                {isLoading ? loadingScreen : (
                    <>
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
                        {libraryBrowserMode === LibraryBrowserMode.LIB_SEARCH && filteredSearchData && (
                            <SearchResult
                                librarySearchResponse={filteredSearchData}
                                libraryBrowsingHandler={libraryBrowsingHandler}
                                moduleSelected={moduleSelected}
                                libraryDataFetchingHandler={libraryDataFetchingHandler}
                            />
                        )}
                    </>
                )}
            </div>
        )}
        </>
    );
}
