/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { css } from "@emotion/css";

export const useStyles = () => ({
    addIcon: css({
        color: "var(--vscode-editorInfo-foreground)",
        padding: "5px",
        textTransform: "none",
        justifyContent: "left",
        fontStyle: "normal",
        fontWeight: 400,
        fontSize: "13px",
        lineHeight: "24px"
    }),
    tvalueConfigMenu: css({
        '& .MuiMenuItem-root': {
            fontSize: '12px',
            paddingBottom: "1px",
            paddingTop: "1px"
        }
    }),
    addFieldWrap: css({
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        width: "inherit",
        background: "var(--vscode-editorWidget-background)",
        borderRadius: "4px",
    }),
    input: css({
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
    }),
    popoverRoot: css({
        padding: '5px 10px',
        display: 'flex',
        alignItems: 'center'
    }),
    tooltip: css({
        backgroundColor: "var(--vscode-input-background)",
        color: "var(--vscode-inputValidation-errorBorder)",
        boxShadow: "8px 8px",
        fontSize: 13,
    }),
    errorIcon: css({
        color: "var(--vscode-errorForeground)",
    }),
    tickIcon: css({
        color: "var(--vscode-inputValidation-infoBackground)"
    })
});
