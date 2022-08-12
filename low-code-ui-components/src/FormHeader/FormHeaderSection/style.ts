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
// tslint:disable: ordered-imports
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        formHeaderTitleWrapper: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            borderBottom: '1px solid #d8d8d8',
            paddingLeft: '12px'
        },
        titleIcon: {
            display: 'flex',
            padding: theme.spacing(1),
            paddingLeft: theme.spacing(0),
        },
        formTitleWrapper: {
            width: "100%",
            zIndex: 100,
            height: theme.spacing(6),
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginLeft: '12px'
        },
        mainTitleWrapper: {
            display: 'inline-flex',
            alignItems: 'center',
            width: 'auto'
        },
    }),
    { index: 1 }
);
