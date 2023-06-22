/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { createStyles, makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(() =>
    createStyles({
        listItemText: {
            color: "#595959",
            "& .MuiListItemText-primary": {
                fontFamily: "GilmerRegular",
            }
        },
        menuItem: {
            paddingTop: 0,
            paddingBottom: 0,
        },
        shortcutMenuItem: {
            paddingTop: 0,
            paddingBottom: 0
        },
        menuIcon: {
            marginRight: "10px",
            minWidth: 0
        },
        shortcutItem: {
            color: "#595959F4",
            paddingLeft: "10px",
            "& .MuiListItemText-primary": {
                fontFamily: "GilmerRegular",
                fontSize: "11px",
                lineHeight: "initial",
            }
        }
    })
);
