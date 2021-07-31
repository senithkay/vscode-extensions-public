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

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        sectionWrapper: {
            marginBottom: '0.5rem',
            "& .MuiFormControl-marginNormal": {
                margin: '0 !important',
            },
            '& div[class^="MuiFormGroup-root makeStyles-switchWrapper"]': {
                marginTop: "0.85rem"
            }
        },
        sectionTitle: {
            fontSize: '13px',
            letterSpacing: 'normal',
            textTransform: 'capitalize',
            margin: '0 0 8px',
            fontFamily: 'Gilmer',
            lineHeight: '1rem',
            paddingBottom: '0.6rem',
            fontWeight: 500
        },
        titleContent: {
            display: "flex",
            position: "relative",
            width: "100%"
        },
        switch: {
            position: "absolute",
            top: -theme.spacing(3.375),
            right: theme.spacing(1)
        }
    }),
);
