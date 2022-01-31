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
import React, { useEffect, useState } from "react";

import { Box, Grid, InputBase } from "@material-ui/core";
import debounce from "lodash.debounce";

import SearchIcon from "../../../../../../assets/icons/SearchIcon";

import useStyles from "./style";

export interface SearchBarProps {
    searchQuery: string;
    onSearch: (query: string) => void;
    type: string;
}

const DEBOUNCE_DELAY = 1000;

function SearchBar(props: SearchBarProps) {
    const classes = useStyles();
    const { onSearch, searchQuery } = props;

    const [query, setQuery] = useState(searchQuery);

    const debouncedQueryChanged = debounce(onSearch, DEBOUNCE_DELAY);

    useEffect(() => {
        debouncedQueryChanged(query);
        return () => debouncedQueryChanged.cancel();
    }, [query]);

    const onQueryChanged = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setQuery(event.target.value);
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        if (event.key === "Enter") {
            onSearchPress();
        }
    };

    const onSearchPress = () => {
        debouncedQueryChanged.cancel();
        onSearch(query);
    };

    return (
        <Grid container={true} classes={{ root: classes.searchBarRoot }}>
            <Grid item={true} container={true} xs={true}>
                <InputBase
                    classes={{ root: classes.searchText }}
                    placeholder={"Search for " + props.type}
                    value={query}
                    onChange={onQueryChanged}
                    onKeyDown={onKeyDown}
                    aria-label="search-for-connectors"
                />
            </Grid>
            <Grid item={true} container={true} xs={2} justifyContent="flex-end" data-testid="search-button">
                <Box className={classes.searchBtn} onClick={onSearchPress}>
                    <SearchIcon />
                </Box>
            </Grid>
        </Grid>
    );
}

export default SearchBar;
