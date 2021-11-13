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
// tslint:disable: jsx-no-lambda
import React, { useState } from 'react';

import { Grid, InputBase } from '@material-ui/core';

import { PrimaryButtonSquare } from '../../../../Buttons/PrimaryButtonSquare';

import useStyles from './style';

export interface SearchBarProps {
    searchQuery: string;
    onSearchButtonClick: (searchString: string) => void;
}

function SearchBar(props: SearchBarProps) {
    const classes = useStyles();
    const { onSearchButtonClick, searchQuery } = props;

    const [ searchString, setSearchString ] = useState(searchQuery);

    const onSearchFieldChange = (
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => {
        setSearchString(event.target.value);
    };

    const onKeyDown = (
        event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => {
        if (event.key === 'Enter') {
            onSearchButtonClick(searchString);
        }
    };

    return (
        <Grid container={true} classes={{ root: classes.searchBarRoot }}>
            <Grid item={true} container={true} xs={true}>
                <InputBase
                    classes={{ root: classes.searchText }}
                    placeholder="Search for connectors"
                    value={searchString}
                    onChange={onSearchFieldChange}
                    onKeyDown={onKeyDown}
                    aria-label="search-for-connectors"
                />
            </Grid>
            <Grid
                item={true}
                container={true}
                xs={2}
                justifyContent="flex-end"
                data-testid="search-button"
            >
                <PrimaryButtonSquare
                    onClick={() => onSearchButtonClick(searchString)}
                    text="Search"
                />
            </Grid>
        </Grid>
    );
}

export default SearchBar;
