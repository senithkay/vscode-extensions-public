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
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        headerWrapper: {
            display: 'flex',
        },
        headerLabel: {
            background: 'white',
            padding: 10,
            borderRadius: 5,
            border: '1px solid #dee0e7',
            margin: '1rem 0 0.25rem',
            justifyContent: 'space-between',
            display: 'flex',
            width: '100%',
            alignItems: 'center',
        },
        disabledColor: {
            color: "rgba(0, 0, 0, 0.26)"
        },
        headerLabelCursor: {
            cursor: "pointer",
            width: "100%"
        },
        paramEditorWrap: {
            boxSizing: "border-box",
            height: "153px",
            width: "100%",
            border: "1px solid #EEEEEE",
            backgroundColor: "#F7F8FB",
        },
        functionParamEditorWrap: {
            boxSizing: "border-box",
            width: "100%",
            border: "1px solid #EEEEEE",
            backgroundColor: "#F7F8FB",
            padding: theme.spacing(2),
            borderRadius: 4
        },
        labelOfInputs: {
            height: "24px",
            width: "38px",
            color: "#1D2028",
            fontSize: "13px",
            letterSpacing: "0",
            lineHeight: "24px"
        },
        actionBtn: {
            fontSize: 13,
        },
        btnContainer: {
            display: "flex",
            justifyContent: "flex-end",
            marginTop: theme.spacing(1)
        },
        iconBtn: {
            padding: 0
        }
    })
);
