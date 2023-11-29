/**
 * Copyright (c) 2020, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: ordered-imports
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        localVarFormWrapper: {
            width: '100%',
            maxHeight: 800,
            overflowY: 'scroll',
            flexDirection: "row",
        },
        addNewButtonWrapper: {
            display: "flex",
            marginTop: 15,
            marginLeft: 20,
            marginRight: 10,
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
        },
        headerWrapper: {
            background: "white",
            padding: 10,
            borderRadius: 5,
            cursor: "pointer",
            border: "1px solid #dee0e7",
            marginTop: 15,
            marginLeft: 20,
            marginRight: 10,
            justifyContent: "space-between",
            display: "flex",
            flexDirection: 'row',
            height: 40,
            alignItems: 'center'
        },
        contentSection: {
            display: "flex",
            width: "75%",
            justifyContent: "flex-start"
        },
        varMgtToolbar: {
            padding: 10,
            display: "inline-flex",
            alignItems: "center",
            "& a": {
                cursor: "pointer",
                color: "#5567D5"
            },
            "& a:hover": {
                textDecoration: "none",
            }
        },
        marginSpace: {
            marginLeft: 15,
            marginRight: 15
        },
        deleteLetVarDecl: {
            display: "flex",
            alignItems: "center",
            color: "#d2897f",
            cursor: "pointer",
            "& svg": {
                marginRight: 8
            }
        },
        deleteLetVarDeclEnabled: {
            color: "#fa4c36",
            fontWeight: 500
        },
        declWrap: {
            alignItems: 'center',
            display: 'inline-block',
            maxWidth: '500px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            padding: '5px',
            verticalAlign: 'middle'
        },
        declExpression: {
            background: theme.palette.grey[100],
            borderRadius: 5,
            cursor: 'pointer',
            padding: 5,
            marginLeft: 5,
            marginRight: 5,
            transition: 'border 0.2s',
            border: `1px solid transparent`,
            '&:hover': {
                border: `1px solid ${theme.palette.grey[300]}`
            }
        },
        exprPlaceholder: {
            background: '#fff3e0',
            '&:hover': {
                border: `1px solid #ffb74d`
            }
        },
        input: {
            maxWidth: '120px',
            padding: "5px",
            border: 0,
            '&:hover': { outline: 0 },
            '&:focus': { outline: 0 },
            background: 'transparent'
        },
        plusButton: {
            marginLeft: '10px',
            marginBottom: '-15px'
        }
    }),
    { index: 1 }
);
