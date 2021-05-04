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
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        diagramErrorMessageWrapper: {
            width: 600,
            bottom: "12rem",
            right: "5rem",
            position: "absolute",
            marginRight: 'auto',
            zIndex: 101,
            background: "#f5f5f5",
            borderRadius: "0.5rem",
            border: "1px solid #fe523c6e",
            maxHeight: '70vh',
            overflowY: 'auto',
            padding: '0 1rem',
            boxShadow: "inset 0 -1px 0 0 #D3D4DD, 0 5px 50px 0 rgba(102,103,133,0.15)",
        },
        diagramErrorMessageItem: {
            display: "flex",
            padding: "1rem 0",
            alignItems: "center",
        },
        diagramErrorItemDivider: {
            height: 0.5,
            background: "#E6E7EC",
        },
        diagramErrorMessageText: {
            flex: 1,
        },
        diagramErrorMessageButton: {
            height: '2.5rem !important',
            marginLeft: theme.spacing(1),
            textTransform: 'unset',
        },
        diagramErrorMessageGreyButton: {
            height: '2.5rem !important',
            marginLeft: theme.spacing(1),
            textTransform: 'unset',
            "&:hover": {
                boxShadow: 'inset 0 0 0 1px rgb(0 0 0 / 6%), 0 2px 4px 0 rgb(0 0 0 / 9%)',
                backgroundColor: '#f1f4ff',
            },
            "&:disabled": {
                color: '#9e9e9eba !important',
                opacity: 0.75,
                boxShadow: 'inset 0 0 0 1px rgb(255 255 255 / 30%), 0 0 0 0 rgb(0 0 0 / 7%)',
                backgroundColor: '#d4d4d48c !important',
            }
        },
        closeIcon: {
            margin: 5,
            color: "#8D91A3",
            cursor: 'pointer',
        },
        menuPaper: {
            marginTop: theme.spacing(6),
            boxShadow: "inset 0 -1px 0 0 #D3D4DD, 0 5px 50px 0 rgba(102,103,133,0.27)",
            borderRadius: theme.spacing(0.75)
        },
        downArrowIcon: {
            fontSize: "1rem",
            marginLeft: theme.spacing(0.5),
            color: "#E6E7EC",
        },
    }),
);
