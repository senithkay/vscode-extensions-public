/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
        container: {
            width: '100%',
        },
        emptyTitle: {
            marginTop: theme.spacing(6),
            color: theme.palette.text.secondary
        },
        fullHeight: {
            height: '80vh',
        },
        actionList: {
            height: '83vh',
            overflowY: 'scroll',
        },
        actionSubtitle: {
            color: theme.palette.text.hint
        },
        searchBox: {
            position: 'relative',
            height: '32px',
            width: 'inherit',
            border: '1px #E0E3E9',
            borderRadius: '5px',
            boxShadow: 'inset 0 0 0 1px #DEE0E7, inset 0 2px 1px 0 rgba(0,0,0,0.07), 0 0 0 0 rgba(50,50,77,0.07)',
            color: '#545558',
            textIndent: '12px',
            textAlign: 'left',
            marginBottom: '16px',
            paddingLeft: '10px'
        }
    })
);

export default useStyles;
