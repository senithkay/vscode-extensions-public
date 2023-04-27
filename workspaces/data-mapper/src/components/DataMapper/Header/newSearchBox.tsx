// tslint:disable: jsx-no-multiline-js jsx-no-lambda
// import React, { useState } from 'react';
//
// import { Checkbox, FormControlLabel, TextField } from '@material-ui/core';
// import { makeStyles } from '@material-ui/core/styles';
//
// const useStyles = makeStyles((theme) => ({
//     root: {
//         display: 'flex',
//         alignItems: 'center',
//     },
//     searchBox: {
//         flex: '1',
//         marginRight: theme.spacing(2),
//     },
// }));
//
// function SearchBox(props: any) {
//     const classes = useStyles();
//     const [searchTerm, setSearchTerm] = useState('');
//     const [searchInInputs, setSearchInInputs] = useState(true);
//     const [searchInOutputs, setSearchInOutputs] = useState(true);
//
//     const handleSearchInputChange = (event: any) => {
//         setSearchTerm(event.target.value);
//     };
//
//     const handleSearchInInputsChange = (event: any) => {
//         setSearchInInputs(event.target.checked);
//     };
//
//     const handleSearchInOutputsChange = (event: any) => {
//         setSearchInOutputs(event.target.checked);
//     };
//
//     const handleSearch = () => {
//         props.onSearch({
//             searchTerm,
//             searchInInputs,
//             searchInOutputs,
//         });
//     };
//
//     return (
//         <div className={classes.root}>
//             <TextField
//                 className={classes.searchBox}
//                 variant="outlined"
//                 label="Search"
//                 value={searchTerm}
//                 onChange={handleSearchInputChange}
//                 onKeyPress={(event) => {
//                     if (event.key === 'Enter') {
//                         handleSearch();
//                     }
//                 }}
//             />
//             <FormControlLabel
//                 control={(
//                     <Checkbox
//                         checked={searchInInputs}
//                         onChange={handleSearchInInputsChange}
//                     />
//                 )}
//                 label="Search in Inputs"
//             />
//             <FormControlLabel
//                 control={(
//                     <Checkbox
//                         checked={searchInOutputs}
//                         onChange={handleSearchInOutputsChange}
//                     />
//                 )}
//                 label="Search in Outputs"
//             />
//         </div>
//     );
// }
//
// export default SearchBox;

import React, { useState } from 'react';

import {
    Checkbox,
    FormControl, InputAdornment,
    InputLabel,
    ListItemText,
    makeStyles,
    MenuItem,
    Select,
    TextField,
} from '@material-ui/core';
import CloseRoundedIcon from "@material-ui/icons/CloseRounded";

const useStyles = makeStyles((theme) => ({
    searchBox: {
        display: 'flex',
        alignItems: 'center',
        height: 30,
    },
    textField: {
        flex: 1,
        marginRight: 16,
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderWidth: 1,
            },
            '&.Mui-focused fieldset': {
                borderWidth: 2,
            },
        },
        '& .MuiOutlinedInput-input': {
            padding: '6px 7px',
        },
    },
}));

interface Props {
    onSearch: (searchData: { searchTerm: string; searchOption: string }) => void;
}

const SearchBox: React.FC<Props> = ({ onSearch }) => {
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
                className={classes.textField}
                variant="outlined"
                // label="Search"
                value={searchTerm}
                onChange={handleSearchInputChange}
                onKeyPress={(event) => {
                    if (event.key === 'Enter') {
                        handleSearch();
                    }
                }}
                InputProps={{
                    endAdornment: (
                        <>
                            {searchTerm && (
                                <InputAdornment position="end">
                                    <CloseRoundedIcon
                                        fontSize='small'
                                        onClick={undefined}
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
                                    <MenuItem value="inputs">
                                        <Checkbox checked={searchOption.indexOf('inputs') > -1} />
                                        <ListItemText primary="Inputs" />
                                    </MenuItem>
                                    <MenuItem value="outputs">
                                        <Checkbox checked={searchOption.indexOf('outputs') > -1} />
                                        <ListItemText primary="Outputs" />
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

export default SearchBox;
