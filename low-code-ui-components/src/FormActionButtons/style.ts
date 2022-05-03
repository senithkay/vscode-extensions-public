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
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        footer: {
            height: 'auto',
            display: 'flex',
            width: '100%',
            paddingRight: theme.spacing(2.5),
        },
        buttonWrapper: {
            display: 'flex',
            justifyContent: 'flex-end',
            width: '50%',
        },
        stmtEditorToggle: {
            width: '50%'
        },
        spaceBetween: {
            padding: `${theme.spacing(1)}px ${theme.spacing(0.1)}px`,
            '&:last-child': {
                paddingRight: 0
            }
        }
    })
);
