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
        headerContainer: {
            width: "100%",
            height: 50,
            display: "flex",
            padding: 15,
            backgroundColor: "white",
            alignItems: "center",
            borderBottom: "1px solid rgba(102,103,133,0.15)"
        },
        homeButton: {
            cursor: "pointer",
            marginRight: 10
        },
        closeButton: {
            cursor: "pointer",
        },
        title: {
            fontWeight: 600,
            marginRight: 10
        },
        configurationButton: {
            "& :hover": {
                background: "#e5e6ea",
                cursor: "pointer"
            },
            boxSizing: "border-box",
            padding: "4px 16px 4px 10px",
            background: "#F7F8FB",
            border: "1px solid #E0E2E9",
            boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
            borderRadius: 5,
            display: "inline-flex",
            color: "#40404B",
            alignItems: "center",
            position: "absolute",
            right: 15,
        },
        confBtnText: {
            fontWeight: 400,
            fontSize: 13,
            lineHeight: 24,
            marginLeft: 5,
        },
        breadCrumb: {
            width: "100%",
            display: "flex"
        }
    }),
);
