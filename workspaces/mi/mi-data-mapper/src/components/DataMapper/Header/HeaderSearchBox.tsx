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
import { Codicon, TextField } from '@wso2-enterprise/ui-toolkit';
import HeaderSearchBoxOptions from './HeaderSearchBoxOptions';
import { DataMapperNodeModel } from '../../Diagram/Node/commons/DataMapperNode';
import { SubMappingNode } from '../../Diagram/Node';
import { isInputNode, isOutputNode } from '../../Diagram/Actions/utils'

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

interface HeaderSearchBoxProps {
    nodes: DataMapperNodeModel[];
}

export default function HeaderSearchBox(props: HeaderSearchBoxProps) {

    const { nodes } = props;

    // const [searchTerm, setSearchTerm] = useState('');
    const searchTermRef=useRef("");
    const searchTerm=searchTermRef.current;
    const setSearchTerm=(term:string)=>{
        searchTermRef.current=term;
    }

    const [searchOptions, setSearchOptions] = useState<string[]>([]);
    const [inputSearchTerm, setInputSearchTerm] = useState<SearchTerm>();
    const [outputSearchTerm, setOutputSearchTerm] = useState<SearchTerm>();
    const dmStore = useDMSearchStore.getState();

    const searchInputRef = useRef<HTMLInputElement>(null);
    const prevInSearchTermRef = useRef<string>("");
    const prevOutSearchTermRef = useRef<string>("");

    const inputNode = nodes.find((node) => (isInputNode(node) && !(node instanceof SubMappingNode)));
    const outputNode = nodes.find(isOutputNode);

    const searchOptionsData = [
        { value: INPUT_FIELD_FILTER_LABEL, label: "Filter in inputs" },
        { value: OUTPUT_FIELD_FILTER_LABEL, label: "Filter in outputs" }
    ];

    const handleSearchInputChange = (text: string) => {
        debouncedOnChange(text);
        setSearchTerm(text);
    };

    const handleSearch = (term: string) => {
        console.log(term);
        const [inSearchTerm, outSearchTerm] = getInputOutputSearchTerms(term);

        const hasInputFilterLabelChanged = !inputSearchTerm
            || (inputSearchTerm && inSearchTerm && inputSearchTerm.isLabelAvailable !== inSearchTerm.isLabelAvailable);
        const hasOutputFilterLabelChanged = !outputSearchTerm
            || (outputSearchTerm && outSearchTerm && outputSearchTerm.isLabelAvailable !== outSearchTerm.isLabelAvailable);

        if (hasInputFilterLabelChanged || hasOutputFilterLabelChanged) {
            let modifiedSearchOptions: string[] = searchOptions;
            if (hasInputFilterLabelChanged) {
                if (!searchOptions.includes(INPUT_FIELD_FILTER_LABEL)) {
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
                if (!searchOptions.includes(OUTPUT_FIELD_FILTER_LABEL)) {
                    if (outSearchTerm && outSearchTerm.isLabelAvailable) {
                        modifiedSearchOptions.push(OUTPUT_FIELD_FILTER_LABEL);
                    }
                } else {
                    if (!outSearchTerm || !outSearchTerm.isLabelAvailable) {
                        modifiedSearchOptions = modifiedSearchOptions.filter(option => option !== OUTPUT_FIELD_FILTER_LABEL);
                    }
                }
            }
            setSearchOptions(modifiedSearchOptions);
        }

        setInputSearchTerm(inSearchTerm);
        setOutputSearchTerm(outSearchTerm);
        dmStore.setInputSearch(inSearchTerm.searchText.trim());
        dmStore.setOutputSearch(outSearchTerm.searchText.trim());

        if (inputNode && prevInSearchTermRef.current != inSearchTerm.searchText) {
            inputNode.setPosition(inputNode.getX(), 0);
            prevInSearchTermRef.current = inSearchTerm.searchText;
        }

        if (outputNode && prevOutSearchTermRef.current != outSearchTerm.searchText) {
            outputNode && outputNode.setPosition(outputNode.getX(), 0);
            prevOutSearchTermRef.current = outSearchTerm.searchText;
        }
    };

    const handleOnSearchTextClear = () => {
        handleSearch("");
        setSearchTerm("");
    };

    useEffect(() => {
        const [inSearchTerm, outSearchTerm] = getInputOutputSearchTerms(searchTerm);
        let modifiedSearchTerm = searchTerm;
        if (searchOptions.includes(INPUT_FIELD_FILTER_LABEL)) {
            if (inSearchTerm && !inSearchTerm.isLabelAvailable) {
                modifiedSearchTerm = modifiedSearchTerm.trimEnd() + ` ${INPUT_FIELD_FILTER_LABEL}`;
            }
        } else {
            if (inSearchTerm && inSearchTerm.isLabelAvailable) {
                modifiedSearchTerm = modifiedSearchTerm.replace(`${INPUT_FIELD_FILTER_LABEL}${inSearchTerm.searchText}`, '');
            }
        }
        if (searchOptions.includes(OUTPUT_FIELD_FILTER_LABEL)) {
            if (outSearchTerm && !outSearchTerm.isLabelAvailable) {
                modifiedSearchTerm = modifiedSearchTerm.trimEnd() + ` ${OUTPUT_FIELD_FILTER_LABEL}`;
            }
        } else {
            if (outSearchTerm && outSearchTerm.isLabelAvailable) {
                modifiedSearchTerm = modifiedSearchTerm.replace(`${OUTPUT_FIELD_FILTER_LABEL}${outSearchTerm.searchText}`, '');
            }
        }
        handleSearch(modifiedSearchTerm);
        setSearchTerm(modifiedSearchTerm);
    }, [searchOptions]);

    const debouncedOnChange = debounce((value: string) => handleSearch(value), 4000);
    const filterIcon = (<Codicon name="filter" sx={{ cursor: "auto" }} />);

    return (
        <TextField
            id={`search-${searchOptions}`}
            autoFocus={true}
            icon={{ iconComponent: filterIcon, position: "start" }}
            placeholder={`filter input and output fields`}
            value={searchTerm}
            ref={searchInputRef}
            onTextChange={handleSearchInputChange}
            size={100}
            inputProps={{
                endAdornment: (
                    <HeaderSearchBoxOptions
                        searchTerm={searchTerm}
                        searchInputRef={searchInputRef}
                        searchOptions={searchOptions}
                        setSearchOptions={setSearchOptions}
                        handleOnSearchTextClear={handleOnSearchTextClear}
                        searchOptionsData={searchOptionsData}
                    />
                ),
            }}
        />

    );
}
