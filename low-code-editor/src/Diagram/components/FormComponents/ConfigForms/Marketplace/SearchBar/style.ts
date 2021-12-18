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

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        searchBarRoot: {
            height: '40px',
            width: '95%',
            marginTop: '10px',
            padding: theme.spacing(0.5),
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            border: '1px solid #E6E7EC',
            borderRadius: '28px',
            backgroundColor: theme.palette.common.white,
        },

        searchIcon: {
            height: theme.spacing(2.375),
            width: theme.spacing(2.25),
            marginTop: theme.spacing(1.5),
            marginLeft: theme.spacing(1.375),
            marginBottom: theme.spacing(1.125),
            marginRight: theme.spacing(0.75),
        },
        searchText: {
            width: '100%',
            marginLeft: theme.spacing(2),
            ...theme.typography.subtitle2,
        },
        searchBtn: {
            backgroundColor: theme.palette.primary.main,
            borderRadius: '100%',
            height: '30px',
            width: '30px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: '3px',
            cursor: 'pointer',
        },
    })
);

export default useStyles;
