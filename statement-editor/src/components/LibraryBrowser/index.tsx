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
    LibraryDataResponse,
    LibraryKind,
    LibrarySearchResponse
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { StatementEditorContext } from "../../store/statement-editor-context";
import { useStatementEditorStyles } from "../styles";

import { LibrariesList } from "./LibrariesList";
import { SearchResult } from "./SearchResult";
import { filterByKeyword } from "./utils";

enum LibraryBrowserMode {
    LIB_LIST = 'libraries_list',
    LIB_SEARCH = 'libraries_search',
    LIB_BROWSE = 'library_browse',
}

const DEFAULT_SEARCH_SCOPE = "distribution";

export function LibraryBrowser() {
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

    useEffect(() => {
        (async () => {
            const response = await getLibrariesData();
            if (response) {
                setLibrariesSearchData(response);
            }
        })();
    }, []);

    useEffect(() => {
        let filteredData;
        if (librariesSearchData && searchScope === DEFAULT_SEARCH_SCOPE) {
            filteredData = filterByKeyword(librariesSearchData, keyword);
        } else if (libraryData && searchScope !== DEFAULT_SEARCH_SCOPE) {
            filteredData = filterByKeyword(libraryData.searchData, keyword);
        }
        setFilteredSearchData(filteredData);
        setLibraryBrowserMode(LibraryBrowserMode.LIB_SEARCH);
    }, [keyword]);

    const libraryBrowsingHandler = (data: LibraryDataResponse) => {
        setLibraryData(data);
        setLibraryBrowserMode(LibraryBrowserMode.LIB_BROWSE);
        setSearchScope(data.searchData.modules[0].id);
    };

    const onLangLibSelection = async () => {
        const response = await getLibrariesList(LibraryKind.langLib);

        if (response) {
            setLibraries(response.librariesList);
        }

        setLibraryBrowserMode(LibraryBrowserMode.LIB_LIST);
        setSearchScope(DEFAULT_SEARCH_SCOPE);
        setKeyword('');
    };

    const onStdLibSelection = async () => {
        const response = await getLibrariesList(LibraryKind.stdLib);

        if (response) {
            setLibraries(response.librariesList);
        }

        setLibraryBrowserMode(LibraryBrowserMode.LIB_LIST);
        setSearchScope(DEFAULT_SEARCH_SCOPE);
        setKeyword('');
    };

    const onAllLibSelection = async () => {
        const response = await getAllLibrariesList();

        if (response) {
            setLibraries(response);
        }

        setLibraryBrowserMode(LibraryBrowserMode.LIB_LIST);
        setSearchScope(DEFAULT_SEARCH_SCOPE);
        setKeyword('');
    };

    const getAllLibrariesList = async () => {
        const langLibs = await getLibrariesList(LibraryKind.langLib);
        const stdLibs = await getLibrariesList(LibraryKind.stdLib);
        if (langLibs && stdLibs) {
            return [...langLibs.librariesList, ...stdLibs.librariesList];
        }
        return [];
    }

    return (
        <div className={statementEditorClasses.LibraryBrowser}>
            <div className={statementEditorClasses.LibraryDropdown}>
                <span className={statementEditorClasses.subHeader}>Libraries</span>
                {/*TODO: Replace below buttons with a dropdown menu*/}
                <button onClick={onAllLibSelection}>All</button>
                <button onClick={onLangLibSelection}>Language</button>
                <button onClick={onStdLibSelection}>Standard</button>
            </div>
            <input
                className={statementEditorClasses.librarySearchBox}
                value={keyword}
                placeholder={`search in ${searchScope}`}
                onChange={(e) => setKeyword(e.target.value)}
            />
            {libraryBrowserMode === LibraryBrowserMode.LIB_LIST && (
                <LibrariesList
                    libraries={libraries}
                    libraryBrowsingHandler={libraryBrowsingHandler}
                />
            )}
            {libraryBrowserMode === LibraryBrowserMode.LIB_SEARCH  && filteredSearchData && (
                <SearchResult
                    librarySearchResponse={filteredSearchData}
                    libraryBrowsingHandler={libraryBrowsingHandler}
                />
            )}
            {libraryBrowserMode === LibraryBrowserMode.LIB_BROWSE  && (
                <SearchResult
                    librarySearchResponse={libraryData.searchData}
                />
            )}
        </div>
    );
}
