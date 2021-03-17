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
        groupedForm: {
            height: "auto",
            width: "100%",
            backgroundColor: "#FFF",
            padding: "0.5rem 0 1rem 0",
            "& .MuiInputBase-root": {
                width: '100% !important',
            },
            "& .MuiFormControl-marginNormal": {
                margin: '0 !important',
            },
        },
        accordionWrapper: {
            marginTop: '8px',
            width: '100%',
        },
        accordionRoot: {
            margin: '0 !important',
            padding: 0,
            border: "2px solid #DEE0E7",
            boxShadow: 'none',
            borderRight: 0,
            borderTop: 0,
            borderBottom: 0,
            '&:not(:last-child)': {
                marginTop: 0,
            },
            '&:first-child': {
                marginBottom: 0,
            },
            '&:before': {
                display: 'none',
            },
            '& .Mui-expanded': {
                margin: 0,
            },
            '& .MuiIconButton-edgeEnd': {
                margin: 'unset',
            },
            expanded: {},
        },
        accordionSummary: {
            padding: '0 0 0 16px',
            minHeight: '32px !important',
            root: {
                marginBottom: -1,
                padding: '0 0 0 16px',
                '& .Mui-expanded': {
                    minHeight: '32px !important',
                },
            },
            expanded: {
                backgroundColor: 'lavender',
                padding: '0 0 0 16px',
            },
        },
        accordionDetails: {
            padding: '0 0 0 16px',
            root: {
                display: 'flex',
            },
        },
        accordionHeading: {
            color: theme.palette.text.primary,
            fontSize: "13px",
            fontWeight: 500,
            flexBasis: '33.33%',
            flexShrink: 0,
            textTransform: 'capitalize',
        },
        accordionSecondaryHeading: {
            color: '#CBCEDB',
            fontSize: "13px",
            fontWeight: 500,
            textTransform: 'capitalize',
        },
        accordionSecondaryRedHeading: {
            color: '#DC143C',
            fontSize: "13px",
            textTransform: 'capitalize',
        },
    }),
);
