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
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        treeLabel: {
            verticalAlign: "middle",
            padding: "5px",
            color: "#222228",
            fontFamily: "GilmerMedium",
            fontSize: "13px",
            minWidth: "100px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #DEE0E7",
            display: "flex",
            minHeight: "24px",
            boxShadow: '0 2px 40px 0 rgba(102,103,133,0.15)',
        },
        treeLabelOutPort: {
            float: "right",
            width: 'fit-content',
            marginLeft: "auto",
        },
        treeLabelInPort: {
            float: "left",
            marginRight: "5px",
            width: 'fit-content',
        },
        typeLabel: {
            marginLeft: "3px",
            verticalAlign: "middle",
            padding: "5px",
            color: "#222228",
            fontFamily: "GilmerRegular",
            fontSize: "13px",
            minWidth: "100px",
            backgroundColor: "#FFFFFF",
            marginRight: "24px"
        },
        valueLabel: {
            verticalAlign: "middle",
            padding: "5px",
            color: "#222228",
            fontFamily: "GilmerMedium",
            fontSize: "13px",
            backgroundColor: "#FFFFFF",
        },
        group: {
            marginLeft: "0px",
            paddingLeft: "0px",
            paddingBottom: "5px"
        },
        content: {
            borderTopRightRadius: theme.spacing(2),
            borderBottomRightRadius: theme.spacing(2),
            paddingRight: theme.spacing(1),
        },
        addIcon: {
            color: "#5567D5",
            padding: "5px",
            textTransform: "none"
        }
    }),
);
