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
        iconSection: {
            display: "flex",
            flexDirection: "row",
            width: "25%",
            justifyContent: "flex-end"
        },
        editIconWrapper: {
            cursor: "pointer",
            height: 14,
            width: 14
        },
        recordOptions: {
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
        undoButton: {
            padding: 2
        },
        clauseWrap: {
            alignItems: 'center',
            display: 'inline-block',
            maxWidth: '500px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            padding: '5px',
            verticalAlign: 'middle'
        },
        clauseExpression: {
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
        input: {
            maxWidth: '120px',
            padding: "5px",
            border: 0,
            '&:hover': { outline: 0 },
            '&:focus': { outline: 0 },
            background: 'transparent'
        },
    }),
    { index: 1 }
);
