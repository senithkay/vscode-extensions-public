/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-multiline-js jsx-no-lambda
import React, { useEffect, useState } from 'react';

import debounce from "lodash.debounce";

import { useDMSearchStore } from "../../../store/store";
import { SelectionState } from "../DataMapper";

import { getInputOutputSearchTerms } from "./utils";
import { SearchBox } from '@wso2-enterprise/ui-toolkit';

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

interface SearchBoxProps {
    selection: SelectionState;
}

export default function SearchBoxWrapper(props: SearchBoxProps) {
    const { selection } = props;
    const [searchTerm, setSearchTerm] = useState('');
    const [searchOption, setSearchOption] = useState<string[]>([]);
    const [inputSearchTerm, setInputSearchTerm] = useState<SearchTerm>();
    const [outputSearchTerm, setOutputSearchTerm] = useState<SearchTerm>();
    const dmStore = useDMSearchStore.getState();

    const handleSearchInputChange = (text: string) => {
        debouncedOnChange(text);
        setSearchTerm(text);
    };

    const handleSearchOptionChange = (event:  React.ChangeEvent<{value: string[]}>) => {
        setSearchOption(event.target.value);
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

    useEffect(() => {
        handleOnSearchTextClear();
    }, [selection.selectedST.fieldPath]);

    const debouncedOnChange = debounce((value: string) => handleSearch(value), 400);

    return (
        <>
            <SearchBox
                id={`search-${searchOption}`}
                autoFocus={true}
                placeholder={`filter input and output fields`}
                value={searchTerm}
                onChange={handleSearchInputChange}
                size={100}
            />
        </>
    )
}
