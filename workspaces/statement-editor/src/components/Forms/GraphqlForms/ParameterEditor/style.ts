/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paramContainer: {
            marginTop: 5,
            display: 'flex',
            flexDirection: `column`,
            borderRadius: 5,
            border: '1px solid #dee0e7',
            padding: 10
        },
        paramContent: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between'
        },
        paramTypeWrapper: {
            display: 'block',
            width: "32%"
        },
        paramDataTypeWrapper: {
            width: '32%'
        },
        paramNameWrapper: {
            width: '32%'
        },
        headerNameWrapper: {
            width: '33%'
        },
        headerWrapper: {
            display: 'flex',
        },
        headerLabel: {
            background: 'white',
            borderRadius: 5,
            border: '1px solid #dee0e7',
            marginTop: 8,
            display: 'flex',
            width: '100%',
            height: 40,
            alignItems: 'center',
        },
        headerLabelWithCursor: {
            background: 'white',
            padding: 10,
            borderRadius: 5,
            cursor: "pointer",
            border: '1px solid #dee0e7',
            marginTop: 8,
            justifyContent: 'space-between',
            display: 'flex',
            height: 40,
            width: '100%',
            alignItems: 'center',
        },
        enabledHeaderLabel: {
            cursor: "pointer",
            width: "85%",
            marginTop: 7,
            marginLeft: 10,
            lineHeight: "24px"
        },
        disabledHeaderLabel: {
            width: "85%",
            color: "rgba(0, 0, 0, 0.26)",
            marginTop: 7,
            marginLeft: 10,
            lineHeight: "24px"
        },
        iconSection: {
            display: "flex",
            flexDirection: "row",
            cursor: "pointer",
            height: 40,
            width: 225,
            borderRadius: "4px 0 0 4px",
            backgroundColor: "#F0F1FB",
        },
        iconWrapper: {
            cursor: "pointer",
            height: 14,
            width: 14,
            marginTop: 13,
            marginBottom: 13,
            marginLeft: 10
        },
        iconTextWrapper: {
            marginTop: 13,
            marginLeft: 5,
            lineHeight: "14px",
            fontSize: 12
        },
        contentSection: {
            display: "flex",
            flexDirection: "row",
            height: 40,
            width: "100%"
        },
        contentIconWrapper: {
            cursor: "pointer",
            height: 14,
            width: 14,
            marginTop: 13,
            marginBottom: 13,
            marginLeft: 10.5
        },
        deleteButtonWrapper: {
            cursor: "pointer",
            height: 14,
            width: 14,
            marginTop: 12,
            marginBottom: 13,
            marginLeft: 10.5
        },
        iconBtn: {
            padding: 0
        },
        btnContainer: {
            marginTop: theme.spacing(2.5),
            display: "flex",
            justifyContent: "flex-end"
        },
        actionBtn: {
            fontSize: 13,
        },
        addHeaderBtn: {
            paddingLeft: 0,
            marginTop: 6,
            textTransform: 'initial',
            marginLeft: -200
        },
        payload: {
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0',
            lineHeight: '14px',
            paddingLeft: '0px',
        }
    }),
);

