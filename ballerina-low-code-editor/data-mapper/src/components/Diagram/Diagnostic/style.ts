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
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

export const tooltipBaseStyles = {
    tooltip: {
        color: "#8d91a3",
        backgroundColor: "#fdfdfd",
        border: "1px solid #e6e7ec",
        borderRadius: 6,
        padding: "1rem"
    },
    arrow: {
        color: "#fdfdfd"
    }
};

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        element: {
            backgroundColor: theme.palette.common.white,
            padding: "10px",
            cursor: "pointer",
            transitionDuration: "0.2s",
            userSelect: "none",
            pointerEvents: "auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            "&:hover": {
                filter: "brightness(0.95)",
            },

        },
        iconWrapper: {
            height: "22px",
            width: "22px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        },
        divider: {
            margin: '5px 0px'
        },
        editorLink: {
            color: "#5567D5",
            fontSize: 12,
            marginTop: 10,
            cursor: 'pointer',
            transition: "all 0.2s",
            '&:hover': {
                color: "#8190ef",
            },
            fontFamily: "'Gilmer', sans-serif"
        },
        pre: {
            margin: 0,
            overflowX: "auto",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            backgroundColor: "white"
        },
        code: {
            color: "#2f3e9c",
            fontSize: 12
        },
        diagnosticWrapper: {
            width: '231px',
            color: '#FE523C',
            fontFamily: "Droid Sans Mono",
            fontSize: '12px',
            letterSpacing: '0',
        },
        source: {
            display: "flex",
            flexDirection: "column"
        },
        editText: {
            color: "#5567D5",
            textTransform: "none",
            justifyContent: "left",
            fontSize: "11px",
        },
        editButton: {
            height: "11px",
            width: "11px"
        }
    })
);
