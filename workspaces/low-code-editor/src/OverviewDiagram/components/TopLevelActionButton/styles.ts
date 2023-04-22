/*
 * Copyright (c) 2023, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        fab: {
            position: "absolute",
            bottom: 15,
            left: 15,
            backgroundColor: theme.palette.primary.main,
            borderRadius: "2px",
            color: "white",
            fontSize: "12px",
            marginInline: "2.5px",
            "&:hover": {
                backgroundColor: "#4958ba",
            },
        },
        addComponentButton: {
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 4,
            padding: '4px 9px 4px 6px',
            backgroundColor: theme.palette.primary.main,
            color: "white",
            marginLeft: 'auto',
            height: 32,
        }
    })
);
