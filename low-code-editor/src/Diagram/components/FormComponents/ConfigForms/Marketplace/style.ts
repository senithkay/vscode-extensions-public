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

import {
    createStyles,
    makeStyles,
    Theme,
} from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        balModuleListWrap: {
            marginTop: theme.spacing(2),
            height: '80vh',
            overflowY: 'scroll',
        },
        balModuleSectionWrap: {
            marginTop: theme.spacing(6),
            '&:first-child': {
                marginTop: 0
            }
        },
        container: {
            width: 600,
            height: '85vh',
            '& .MuiFormControl-marginNormal': {
                margin: '0 !important',
            },
        },
        msgContainer: {
            height: '80vh',
            alignContent: 'center',
            alignItems: 'center',
        },
        resultsContainer: {
            marginTop: theme.spacing(6),
        },
        filterTagWrap: {
            maxHeight: '48px',
        },
        filterTag: {
            border: '1px solid #E6E7EC',
            borderRadius: '8px',
            paddingLeft: '8px'
        },
        filterRemoveBtn: {
            padding: '8px',
        }
    })
);

export default useStyles;
