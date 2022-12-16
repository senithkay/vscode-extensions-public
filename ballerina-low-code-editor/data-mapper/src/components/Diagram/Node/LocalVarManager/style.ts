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
        recordFormWrapper: {
            width: '100%',
            maxHeight: 540,
            overflowY: 'scroll',
            flexDirection: "row",
        },
        createButtonWrapper: {
            display: "flex",
            margin: 16,
            flexDirection: "column",
            "& button": {
                marginBottom: 16
            }
        },
        doneButtonWrapper: {
            display: 'flex',
            justifyContent: 'flex-end',
            marginRight: 20,
            marginTop: 16,
        }
    }),
    { index: 1 }
);
