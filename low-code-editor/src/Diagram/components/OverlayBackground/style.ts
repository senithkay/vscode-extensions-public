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
import { createStyles, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(() =>
    createStyles({
        overlayBackground: {
            background: '#e6e7ec6e',
            top: '-250rem;',
            position: 'fixed',
            zIndex: 1,
            left: '-250rem',
        },

        confirmationOverlayBackground: {
            background: 'rgba(255,255,255,0.9)',
            top: '-250rem;',
            position: 'fixed',
            zIndex: 2,
            left: '-250rem',
        },
    }),
);
