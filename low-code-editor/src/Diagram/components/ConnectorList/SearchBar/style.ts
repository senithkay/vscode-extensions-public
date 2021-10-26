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
            height: theme.spacing(7),
            backgroundColor: theme.palette.common.white,
            boxShadow: '0 5px 20px 0 rgba(50,50,77,0.07)',
            padding: theme.spacing(1),
            flexDirection: 'row',
            alignItems: 'center',
        },
        searchText: {
            width: '100%',
            marginLeft: theme.spacing(2),
            ...theme.typography.subtitle2,
        },
        searchBtn: {
            width: '50%',
        },
    })
);

export default useStyles;
