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
// tslint:disable: jsx-no-multiline-js
import React, { useEffect, useState } from "react";

import { Box, createStyles, InputAdornment, makeStyles, TextField, Theme } from "@material-ui/core";
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import classnames from "classnames";
import debounce from "lodash.debounce";

import FilterIcon from "../../../assets/icons/FilterIcon";

export enum SearchType {
    Input,
    Output
}

export interface FieldFilterProps {
    searchText: string;
    onSearchTextChange: (newValue: string) => void;
    searchType?: SearchType;
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        searchContainer: {
            borderRadius: 5,
            border: `1px solid #E6E7EC`,
            padding: '0 8px',
            height: '32px',
            background: theme.palette.common.white,
            display: 'flex',
            alignItems: 'center',
            boxShadow: 'inset 0 2px 2px rgba(29, 32, 40, 0.07)',
            marginRight: '1rem',
        },
        searchContainerFocused: {
            border: `2px solid #A6B3FF`,
        },
        textField: {
            width: '100%'
        },
        resize: {
            fontSize: '12px'
        },
        clearBtn: {
            color: theme.palette.grey[300],
            cursor: 'pointer',
            transition: "all 0.2s",
            '&:hover': {
                color: theme.palette.grey[600],
            },
        },
        filterIcon: {
            height: '10px',
        }
    }),
);

export default function FieldFilter(props: FieldFilterProps) {
    const { searchText, onSearchTextChange, searchType } = props;
    const classes = useStyles();
    const [filterText, setFilterText] = useState(searchText);
    const [focused, setIsFocused] = useState(false);

    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        debouncedOnChange(event.target.value);
        setFilterText(event.target.value);
    };

    const handleOnSearchTextChange = () => {
        onSearchTextChange("");
        setFilterText("");
    };

    const handleOnFocus = () => {
        setIsFocused(true);
        setFilterText(searchText);
    };

    const handleOnBlur = () => {
        setIsFocused(false);
    };

    useEffect(() => {
        if (!focused && searchText !== "") {
            setFilterText(`${searchType === SearchType.Input ? `input: ` : `output: `}${searchText}`);
        }
    }, [focused, searchText]);

    const debouncedOnChange = debounce((value: string) => onSearchTextChange(value), 400);

    return (
        <>
            <Box
                className={classnames(classes.searchContainer,
                    focused && classes.searchContainerFocused
                )}
                width={200}
                key={`search-${searchType}-wrap`}
            >
                <TextField
                    id={`search-${searchType}`}
                    placeholder={`filter ${searchType === SearchType.Input ? 'input' : 'output'}`}
                    className={classes.textField}
                    value={filterText}
                    onChange={handleOnChange}
                    onFocus={handleOnFocus}
                    onBlur={handleOnBlur}
                    InputProps={{
                        classes: {
                            input: classes.resize
                        },
                        startAdornment: (
                            <InputAdornment position="start" className={classes.filterIcon}>
                                <FilterIcon height={"12px"} width={"12px"}/>
                            </InputAdornment>
                        ),
                        endAdornment: searchText ? (
                            <InputAdornment position="end">
                                <CloseRoundedIcon
                                    fontSize='small'
                                    onClick={handleOnSearchTextChange}
                                    className={classes.clearBtn}
                                    data-testid={`search-clear-${searchType}`}
                                />
                            </InputAdornment>
                        ) : null
                    }}
                />
            </Box>
        </>
    );
}
