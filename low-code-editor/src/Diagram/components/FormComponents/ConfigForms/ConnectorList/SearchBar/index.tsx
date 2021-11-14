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
import { FormattedMessage } from 'react-intl';

import { Grid, InputBase } from "@material-ui/core";

import SearchIcon from '../../../../../../assets/icons/SearchIcon';
import PrimaryRounded from '../../../../Buttons/PrimaryRounded';

import useStyles from "./style";

export interface SearchBarProps {
    searchQuery: string;
    onSearchButtonClick: (searchString: string) => void;
}

function SearchBar(props: SearchBarProps) {
    const classes = useStyles();
    const { onSearchButtonClick, searchQuery } = props;

    const [searchString, setSearchString] = useState(searchQuery);

    const onSearchFieldChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setSearchString(event.target.value);
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        if (event.key === "Enter") {
            onSearchButtonClick(searchString);
        }
    };

    return (
        <Grid container={true} classes={{ root: classes.searchBarRoot }}>
            <SearchIcon className={classes.searchIcon} />
            <Grid item={true} container={true} xs={true}>
                <InputBase
                    classes={{ root: classes.searchText }}
                    placeholder="Search for APIs"
                    value={searchString}
                    onChange={onSearchFieldChange}
                    onKeyDown={onKeyDown}
                    aria-label="search-for-connectors"
                />
            </Grid>
            <Grid item={true} container={true} xs={2} justifyContent="flex-end" data-testid="search-button">
                <PrimaryRounded variant="contained" color="primary" className={classes.searchBtn} onClick={() => onSearchButtonClick(searchString)}>
                    <FormattedMessage id="lowcode.develop.configForms.connectorList.SearchBar.Search" defaultMessage="Search" />
                </PrimaryRounded>
            </Grid>
        </Grid>
    );
}

export default SearchBar;
