/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js jsx-no-lambda
import React, { useEffect, useState, useRef } from 'react';

import debounce from "lodash.debounce";

import { useDMSearchStore } from "../../../store/store";

import { getInputOutputSearchTerms } from "./utils";
import { CheckBox, CheckBoxGroup, ClickAwayListener, Codicon, Menu, MenuItem, SearchBox, TextField } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import HeaderSearchBoxOptions from './HeaderSearchBoxOptions';

export const INPUT_FIELD_FILTER_LABEL = "in:";
export const OUTPUT_FIELD_FILTER_LABEL = "out:";

export enum SearchType {
    INPUT,
    OUTPUT,
}

export interface SearchTerm {
    searchText: string;
    searchType: SearchType;
    isLabelAvailable: boolean;
}

const SearchOptionContainer=styled.div({
    position: "absolute", 
    top: "100%", 
    right: "0", 
    zIndex: 5, 
    backgroundColor: "var(--vscode-sideBar-background)", 
    padding: "5px" 
});

export default function HeaderSearchBox() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchOption, setSearchOption] = useState<string[]>([]);
    const [showSearchOption, setShowSearchOption] = useState(false);
    const [inputSearchTerm, setInputSearchTerm] = useState<SearchTerm>();
    const [outputSearchTerm, setOutputSearchTerm] = useState<SearchTerm>();
    const dmStore = useDMSearchStore.getState();
    const showSearchOptionRef = useRef(null);

    const handleSearchInputChange = (text: string) => {
        debouncedOnChange(text);
        setSearchTerm(text);
    };

    const handleSearchOptionChange = (checked: boolean, value: string) => {
        if (checked) {
            if (searchOption.indexOf(value) === -1) {
                setSearchOption([value, ...searchOption]);
            }
        } else {
            setSearchOption(searchOption.filter(option => option !== value));
        }
    };

    const handleSearch = (term: string) => {
        const [inSearchTerm, outSearchTerm] = getInputOutputSearchTerms(term);
        const hasInputFilterLabelChanged = !inputSearchTerm
            || (inputSearchTerm && inSearchTerm && inputSearchTerm.isLabelAvailable !== inSearchTerm.isLabelAvailable);
        const hasOutputFilterLabelChanged = !outputSearchTerm
            || (outputSearchTerm && outSearchTerm && outputSearchTerm.isLabelAvailable !== outSearchTerm.isLabelAvailable);

        if (hasInputFilterLabelChanged || hasOutputFilterLabelChanged) {
            let modifiedSearchOptions: string[] = searchOption;
            if (hasInputFilterLabelChanged) {
                if (!searchOption.includes(INPUT_FIELD_FILTER_LABEL)) {
                    if (inSearchTerm && inSearchTerm.isLabelAvailable) {
                        modifiedSearchOptions.push(INPUT_FIELD_FILTER_LABEL);
                    }
                } else {
                    if (!inSearchTerm || !inSearchTerm.isLabelAvailable) {
                        modifiedSearchOptions = modifiedSearchOptions.filter(option => option !== INPUT_FIELD_FILTER_LABEL);
                    }
                }
            }
            if (hasOutputFilterLabelChanged) {
                if (!searchOption.includes(OUTPUT_FIELD_FILTER_LABEL)) {
                    if (outSearchTerm && outSearchTerm.isLabelAvailable) {
                        modifiedSearchOptions.push(OUTPUT_FIELD_FILTER_LABEL);
                    }
                } else {
                    if (!outSearchTerm || !outSearchTerm.isLabelAvailable) {
                        modifiedSearchOptions = modifiedSearchOptions.filter(option => option !== OUTPUT_FIELD_FILTER_LABEL);
                    }
                }
            }
            setSearchOption(modifiedSearchOptions);
        }
        setInputSearchTerm(inSearchTerm);
        setOutputSearchTerm(outSearchTerm);
        dmStore.setInputSearch(inSearchTerm.searchText.trim());
        dmStore.setOutputSearch(outSearchTerm.searchText.trim());
    };

    const handleOnSearchTextClear = () => {
        handleSearch("");
        setSearchTerm("");
    };

    useEffect(() => {
        const [inSearchTerm, outSearchTerm] = getInputOutputSearchTerms(searchTerm);
        let modifiedSearchTerm = searchTerm;
        if (searchOption.includes(INPUT_FIELD_FILTER_LABEL)) {
            if (inSearchTerm && !inSearchTerm.isLabelAvailable) {
                modifiedSearchTerm += ` ${INPUT_FIELD_FILTER_LABEL}`;
            }
        } else {
            if (inSearchTerm && inSearchTerm.isLabelAvailable) {
                modifiedSearchTerm = modifiedSearchTerm.replace(`${INPUT_FIELD_FILTER_LABEL}${inSearchTerm.searchText}`, '');
            }
        }
        if (searchOption.includes(OUTPUT_FIELD_FILTER_LABEL)) {
            if (outSearchTerm && !outSearchTerm.isLabelAvailable) {
                modifiedSearchTerm += ` ${OUTPUT_FIELD_FILTER_LABEL}`;
            }
        } else {
            if (outSearchTerm && outSearchTerm.isLabelAvailable) {
                modifiedSearchTerm = modifiedSearchTerm.replace(`${OUTPUT_FIELD_FILTER_LABEL}${outSearchTerm.searchText}`, '');
            }
        }
        handleSearch(modifiedSearchTerm);
        setSearchTerm(modifiedSearchTerm);
    }, [searchOption]);

    const debouncedOnChange = debounce((value: string) => handleSearch(value), 400);
    const filterIcon = (<Codicon name="filter" sx={{ cursor: "auto" }} />);

    return (
        <TextField
            id={`search-${searchOption}`}
            autoFocus={true}
            icon={{ iconComponent: filterIcon, position: "start" }}
            placeholder={`filter input and output fields`}
            value={searchTerm}
            onTextChange={handleSearchInputChange}
            // onBlur={()=>{setShowSearchOption(false)}}
            size={100}
            inputProps={{
                endAdornment: (
                    <HeaderSearchBoxOptions
                    searchTerm={searchTerm}
                    searchOption={searchOption}
                    showSearchOption={showSearchOption}
                    setShowSearchOption={setShowSearchOption}
                    handleOnSearchTextClear={handleOnSearchTextClear}
                    handleSearchOptionChange={handleSearchOptionChange}
                />
                ),
            }}
        />

    );
}
