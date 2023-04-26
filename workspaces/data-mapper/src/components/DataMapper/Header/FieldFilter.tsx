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
import React, { useEffect, useRef } from "react";

import { Box, createStyles, InputAdornment, makeStyles, TextField, Theme } from "@material-ui/core";
import { SearchOutlined } from "@material-ui/icons";
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import debounce from "lodash.debounce";

export enum SearchType {
    Input,
    Output
}

export interface FieldFilterProps {
    searchText: string;
    onSearchTextChange: (newValue: string) => void;
    focused?: boolean;
    setFocused?: (isFocused: boolean) => void;
    searchType?: SearchType;
    width?: number | string;
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        searchContainer: {
            borderRadius: 12,
            border: `1px solid ${theme.palette.grey[100]}`,
            padding: '0 24px',
            background: theme.palette.common.white,
            height: '80%',
            display: 'flex',
            alignItems: 'center'
        },
        textField: {
            width: '100%'
        },
        clearBtn: {
            color: theme.palette.grey[300],
            cursor: 'pointer',
            transition: "all 0.2s",
            '&:hover': {
                color: theme.palette.grey[600],
            },
        }
    }),
);

export default function FieldFilter(props: FieldFilterProps) {
    const { searchText, onSearchTextChange, focused, setFocused, searchType, width = 200 } = props;
    const classes = useStyles();
    const inputRef = useRef<HTMLInputElement>();

    useEffect(() => {
        if (focused) {
            inputRef.current?.focus();
        }
    }, [searchText, focused]);

    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        debouncedOnChange(event.target.value);
    };

    const handleOnFocus = () => {
        setFocused(true);
    };

    const handleOnBlur = () => {
        setFocused(false);
    };

    const handleOnSearchTextChange = () => {
        onSearchTextChange("");
    };

    const debouncedOnChange = debounce((value: string) => onSearchTextChange(value), 400);

    return (
        <>
            <Box className={classes.searchContainer} width={width} key={`search-${searchType}-wrap`}>
                <TextField
                    inputRef={inputRef}
                    id={`search-${searchType}`}
                    placeholder="Search"
                    className={classes.textField}
                    defaultValue={searchText}
                    onChange={handleOnChange}
                    onFocus={handleOnFocus}
                    onBlur={handleOnBlur}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchOutlined />
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
