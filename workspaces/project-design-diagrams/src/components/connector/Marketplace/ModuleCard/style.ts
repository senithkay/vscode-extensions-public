/*
 * Copyright (c) 2023, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import {
    createStyles,
    makeStyles,
    Theme,
} from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        balModule: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
            height: '140px',
            border: '1px solid #E6E7EC',
            borderRadius: '10px',
            backgroundColor: '#FFFFFF',
            padding: theme.spacing(2),
            cursor: 'pointer',
            '&:hover': {
                overflow: 'visible',
                transform: 'scale3d(1.04, 1.04, 1)',
                border: '1px solid #5567D5',
            },
        },
        selectedBalModule: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
            height: '140px',
            border: '1px solid #5567D5',
            borderRadius: '10px',
            backgroundColor: '#f5f6ff',
            padding: theme.spacing(2),
            cursor: 'pointer',
            '&:hover': {
                overflow: 'visible',
                transform: 'scale3d(1.04, 1.04, 1)',
            },
        },
        balModuleName: {
            color: '#222228',
            fontSize: 13,
            width: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontWeight: 500,
            textAlign: 'center',
        },
        orgName: {
            color: '#CBCEDB',
            fontSize: 13,
            width: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textAlign: 'center',
        },
    })
);

export default useStyles;
