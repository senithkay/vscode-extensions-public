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
import React, { useState } from 'react';

import {
    Checkbox,
    FormControl, InputAdornment,
    ListItemText,
    makeStyles,
    MenuItem,
    Select,
    TextField,
} from '@material-ui/core';
import CloseRoundedIcon from "@material-ui/icons/CloseRounded";

import FilterIcon from "../../../assets/icons/FilterIcon";

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

interface Props {
    onSearch: (searchData: { searchTerm: string; searchOption: string }) => void;
}

export default function SearchBox(props: Props) {
    const { onSearch } = props;
    const classes = useStyles();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchOption, setSearchOption] = useState<string[]>([]);

    const handleSearchInputChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setSearchTerm(event.target.value);
    };

    const handleSearchOptionChange = (
        event: React.ChangeEvent<{ value: unknown }>
    ) => {
        setSearchOption(event.target.value as string[]);
    };

    const handleSearch = () => {
        onSearch({
            searchTerm,
            searchOption: searchOption.length > 0 ? searchOption.join(',') : '',
        });
    };

    return (
        <>
            <TextField
                id={`search-${searchOption}`}
                placeholder={`filter input and output fields`}
                className={classes.textField}
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchInputChange}
                onKeyPress={(event) => {
                    if (event.key === 'Enter') {
                        handleSearch();
                    }
                }}
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
                                        onClick={undefined}
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
                                    <MenuItem value="inputs" className={classes.menuItem}>
                                        <Checkbox checked={searchOption.indexOf('inputs') > -1} />
                                        <ListItemText primary="Filter in inputs"/>
                                    </MenuItem>
                                    <MenuItem value="outputs" className={classes.menuItem}>
                                        <Checkbox checked={searchOption.indexOf('outputs') > -1} />
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
