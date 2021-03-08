/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        groupToggleWrapper: {
            margin: '1rem auto'
        },
        mainTitleWrap: {
            display: 'flex',
            justifyContent: 'space-between'
        },
        toggleButtonWrapper: {
            backgroundColor: "#f9f9f9",
            maxHeight: 32,
            width: 32,
            borderRadius: '25px !important',
            margin: '0.5rem',
            border: '0 !important',
            textTransform: 'initial',
            fontWeight: 200,
            "&.MuiToggleButton-root": {
                textTransform: 'initial',
                "&:hover": {
                    backgroundColor: "#c1caff",
                },
            },
            "&.MuiToggleButton-root.Mui-selected": {
                backgroundColor: "#5567d5",
                color: "#fff"
            }
        },
        titleLabel: {
            color: '#222228',
            fontSize: 13,
            marginBottom: '0.5rem',
            letterSpacing: 0,
            paddingTop: '0.5rem',
            marginRight: '0.5rem'
        },
        repeatDropdown: {
            marginRight: '0.5rem',
            "& .MuiSelect-select.MuiSelect-select": {
                padding: "0 8px",
            },
            "& .MuiSelect-icon": {
                marginRight: '0.25rem'
            }
        },
        ".MuiMenu-list": {
            height: 150
        },
        repeatRangeDropdown: {
            width: '56%',
            marginLeft: '1rem',
            "& .MuiSelect-select.MuiSelect-select": {
                padding: "0 8px",
            },
            "& .MuiSelect-icon": {
                marginRight: '0.25rem'
            }
        },
        titleSpacing: {
            paddingTop: '1rem',
            marginRight: '0.5rem'
        },
        repreatMainWarpper: {
            display: "flex",
            verticalAlign: "middle",
            marginBottom: "1rem"
        },
        timeWrapper: {
            borderRadius: 5,
            padding: '0.25rem 1rem',
            margin: '0 0 1rem',
            width: '60%',
            boxShadow: 'inset 0 0 0 1px #dee0e7, inset 0 2px 1px 0 rgb(0 0 0 / 7%), 0 0 0 0 rgb(50 50 77 / 7%);'
        },
        cronGenWrapper: {
            background: '#fafafc',
            padding: '1rem',
            borderRadius: 5,
            marginTop: '1.5rem'
        },
        flexWrapper: {
            display: "flex"
        },
        timeAndRangeWrapper: {
            width: "50%"
        },
        spanWrapper: {
            margin: '0.5rem 0.5rem 0 0'
        },
        outlineTextField: {
            border: '1px solid #E7E8ED',
            borderRadius: 5,
            padding: '0.1rem 0.75rem 0 0.75rem',
            width: 70,
            "& .MuiInput-root": {
                "& .MuiInputBase-input": {
                    padding: '7rem'
                }
            }
        },
        dateTextField: {
            width: 120,
            "& .MuiAutocomplete-hasPopupIcon": {
                paddingRight: "0 !important"
            }
        },
        customRange: {
            textTransform: "uppercase",
            backgroundColor: "red"
        },
        invalidCron: {
            fontSize: '13px !important',
            color: '#ea4c4d !important',
            "&:first-letter": {
                textTransform: 'capitalize',
            }
        }
    })
);
