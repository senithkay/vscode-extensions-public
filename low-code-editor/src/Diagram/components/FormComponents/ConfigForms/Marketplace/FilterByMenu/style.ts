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

import { Checkbox } from '@material-ui/core';
import {
    createStyles,
    makeStyles,
    Theme,
    withStyles,
} from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        content: {
            flexDirection: 'row-reverse',
            marginBottom: theme.spacing(1),
        },
        expandaleFilterByLabel: {
            fontWeight: theme.spacing(62.5),
        },
        labelRoot: {
            display: 'flex',
            alignItems: 'center',
            padding: 0,
        },
        labelIcon: {
            marginRight: theme.spacing(1),
        },
        divider: {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
        },
        filterByMenuDiv: {
            marginTop: theme.spacing(4.5),
        },
        filterByMenuTitle: {
            fontWeight: theme.spacing(62.5),
            marginBottom: theme.spacing(2),
        },
        filterByMenu: {
            flexGrow: theme.spacing(0.125),
            paddingRight: theme.spacing(4),
        },
        groupItem: {
            marginLeft: 0,
            marginBottom: theme.spacing(1),
        },
        selectedItem: {
            backgroundColor: 'transparent',
        },
        selectedValue: {
            '& .MuiTypography-body1': {
                fontWeight: 'bold',
            },
        },
        categoriesRoot: {
            '& .Mui-selected > .MuiTreeItem-content .MuiTreeItem-label': {
                color: theme.palette.primary.main,
            },
        },
        labelItem: {
            backgroundColor: 'transparent !important',
        },
        seeMoreButton: {
            fontWeight: 'normal',
            '&:hover': {
                backgroundColor: 'transparent',
                fontWeight: 'bold',
            },
        },
        filterCategories: {
            '&:hover': {
                color: theme.palette.primary.main,
            },
        },
    })
);

export const CustomCheckbox = withStyles((theme: Theme) => ({
    root: {
        '&$checked': {
            color: theme.palette.success.main,
        },
        paddingTop: theme.spacing(0.625),
        paddingBottom: theme.spacing(0.625),
    },
    checked: {},
}))(Checkbox);

export default useStyles;
