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

import {
    Checkbox,
    FormControl,
    InputAdornment,
    ListItemText,
    makeStyles,
    MenuItem,
    Select,
    TextField,
} from '@material-ui/core';
import CloseRoundedIcon from "@material-ui/icons/CloseRounded";
import debounce from "lodash.debounce";

import FilterIcon from "../../../assets/icons/FilterIcon";
import { useDMSearchStore } from "../../../store/store";

import { getInputOutputSearchTerms, SearchTerm } from "./utils";

const useStyles = makeStyles((theme) => ({
    searchBox: {
        display: 'flex',
        alignItems: 'center',
        height: 30,
    },
    textField: {
        width: '100%',
        background: theme.palette.common.white,
        flex: 1,
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderWidth: 1,
            },
            '&:hover fieldset': {
                border: `2px solid #ccc`,
            },
            '&.Mui-focused fieldset': {
                border: `2px solid #A6B3FF`
            }
        },
        '& .MuiOutlinedInput-input': {
            padding: '6px 7px',
        },
        '&. MuiMenuItem-root': {
            fontSize: '10px'
        }
    },
    menuItem: {
        height: 30,
        paddingLeft: '6px',
        paddingRight: '6px',
        '& .MuiTypography-displayBlock': {
            fontSize: '11px'
        },
        '& .MuiCheckbox-root': {
            height: '5px',
            width: '5px',
            marginRight: '5px',
            color: theme.palette.grey[300],
        },
        '& .MuiListItem-gutters': {
            paddingLeft: '5px',
            paddingRight: '5px',
        }
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
}));

export const INPUT_FIELD_FILTER_LABEL = "in:";
export const OUTPUT_FIELD_FILTER_LABEL = "out:";

export default function SearchBox() {
    const classes = useStyles();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchOption, setSearchOption] = useState<string[]>([]);
    const [inputSearchTerm, setInputSearchTerm] = useState<SearchTerm>();
    const [outputSearchTerm, setOutputSearchTerm] = useState<SearchTerm>();
    const dmStore = useDMSearchStore.getState();

    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        debouncedOnChange(event.target.value);
        setSearchTerm(event.target.value);
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

    const debouncedOnChange = debounce((value: string) => handleSearch(value), 400);

    return (
        <>
            <TextField
                id={`search-${searchOption}`}
                placeholder={`filter input and output fields`}
                className={classes.textField}
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchInputChange}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start" className={classes.filterIcon}>
                            <FilterIcon height={"12px"} width={"12px"}/>
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <>
                            {searchTerm && (
                                <InputAdornment position="end">
                                    <CloseRoundedIcon
                                        fontSize='small'
                                        onClick={handleOnSearchTextClear}
                                        className={classes.clearBtn}
                                        data-testid={`search-clear-${searchTerm}`}
                                    />
                                </InputAdornment>
                            )}
                            <FormControl>
                                <Select
                                    labelId="search-option-label"
                                    displayEmpty={true}
                                    multiple={true}
                                    value={searchOption}
                                    onChange={handleSearchOptionChange}
                                    renderValue={() => ''}
                                    MenuProps={{
                                        getContentAnchorEl: null,
                                        anchorOrigin: {
                                            vertical: 'bottom',
                                            horizontal: 'left',
                                        },
                                    }}
                                >
                                    <MenuItem value={INPUT_FIELD_FILTER_LABEL} className={classes.menuItem}>
                                        <Checkbox checked={searchOption.indexOf(INPUT_FIELD_FILTER_LABEL) > -1} />
                                        <ListItemText primary="Filter in inputs"/>
                                    </MenuItem>
                                    <MenuItem value={OUTPUT_FIELD_FILTER_LABEL} className={classes.menuItem}>
                                        <Checkbox checked={searchOption.indexOf(OUTPUT_FIELD_FILTER_LABEL) > -1} />
                                        <ListItemText primary="Filter in output" />
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </>
                    ),
                }}
            />
        </>
    );
};
