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
        addIcon: {
            color: "#5567D5",
            padding: "5px",
            textTransform: "none",
            justifyContent: "left",
            fontStyle: "normal",
            fontWeight: 400,
            fontSize: "13px",
            lineHeight: "24px"
        },
        tvalueConfigMenu: {
            '& .MuiMenuItem-root': {
                fontSize: '12px',
                paddingBottom: "1px",
                paddingTop: "1px"
            }
        },
        addFieldWrap: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            width: "inherit",
            background: "#F7F8FB",
            borderRadius: "4px",
        },
        input: {
            maxWidth: '120px',
            padding: "5px",
            border: 0,
            '&:hover': { outline: 0 },
            '&:focus': { outline: 0 },
            background: 'transparent',
            fontSize: 13,
            "&::placeholder": {
                opacity: 0.5
            }
        },
        popoverRoot: {
            padding: '5px 10px',
            display: 'flex',
            alignItems: 'center'
        },
        tooltip: {
            backgroundColor: theme.palette.common.white,
            color: theme.palette.error.dark,
            boxShadow: theme.shadows[1],
            fontSize: 13,
        },
        errorIcon: {
            color: theme.palette.error.main,
        },
        tickIcon: {
            color: theme.palette.primary.light
        }
    }),
);
