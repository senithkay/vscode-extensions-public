/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            margin: '25vh 0'
        },
        errorContainer: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        },
        errorTitle: {
            color: theme.palette.grey[500]
        },
        errorMsg: {
            paddingTop: theme.spacing(2),
            color: theme.palette.grey[400]
        },
        errorImg: {
            paddingTop: theme.spacing(10),
            paddingBottom: theme.spacing(5),
            display: "block"
        },
        gridContainer: {
            height: "100%"
        },
        link: {
            color: theme.palette.primary.main,
            textDecoration: "underline",
            "&:hover, &:focus, &:active": {
                color: theme.palette.primary.main,
                textDecoration: "underline",
            }
        }
    })
);
