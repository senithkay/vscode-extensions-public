/**
 * Copyright (c) 2020, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { css } from "@emotion/css";

export const useStyles = () => ({
    localVarFormWrapper: css({
        width: '100%',
        maxHeight: 800,
        overflowY: 'scroll',
        flexDirection: "row",
    }),
    addNewButtonWrapper: css({
        display: "flex",
        marginTop: 20,
        marginLeft: 10,
        flexDirection: "column",
        "& button": {
            marginBottom: 16
        }
    }),
    doneButtonWrapper: css({
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '16px'
    }),
    contentSection: css({
        display: "flex",
        width: "75%",
        justifyContent: "flex-start"
    }),
    varMgtToolbar: css({
        padding: '10px',
        marginTop: '10px',
        display: "inline-flex",
        alignItems: "center",
        "& a": {
            cursor: "pointer",
            color: "var(--vscode-editorInfo-foreground)"
        },
        "& a:hover": {
            textDecoration: "none",
        }
    }),
    localVarControlButton: css({
        padding: '5px',
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
    }),
    deleteLetVarDecl: css({
        color: "var(--vscode-charts-red)"
    }),
    deleteLetVarDeclEnabled: css({
        color: "var(--vscode-terminal-ansiRed)",
        fontWeight: 500
    }),
    declWrap: css({
        alignItems: 'center',
        display: 'inline-block',
        maxWidth: '500px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        padding: '5px',
        verticalAlign: 'middle'
    }),
    declExpression: css({
        background: "var(--vscode-editorHoverWidget-background)",
        marginLeft: "5px",
        marginRight: "5px",
        borderRadius: "4px",
        border: "1px solid transparent",
        cursor: 'pointer',
        padding: 4,
        transition: 'border 0.2s',
        '&:hover': {
            border: "1px solid var(--vscode-pickerGroup-border)"
        }
    }),
    declExpressionError: css({
        border: '1px solid var(--vscode-inputValidation-errorBorder)',
        '&:hover': {
            border: "1px solid var(--vscode-inputValidation-errorBorder)"
        }
    }),
    declExpressionWarning: css({
        display: 'flex',
        padding: '4px',
    }),
    declExpressionErrorMessage: css({
        fontSize: '12px',
        letterSpacing: '0',
        color: "var(--vscode-errorForeground)",
        marginLeft: '5px',
    }),
    exprPlaceholder: css({
        background: 'var(--vscode-inputValidation-warningBackground)'
    }),
    input: css({
        maxWidth: '120px',
        padding: "4px",
        '&:focus': { outline: 0, border: "1px solid var(--vscode-inputOption-activeBorder)" },
        background: "var(--vscode-editorHoverWidget-background)",
        marginLeft: "5px",
        marginRight: "5px",
        color: 'var(--vscode-editor-foreground)',
        borderRadius: "4px",
        border: "1px solid transparent",
    }),
    plusButton: css({
        margin: '5px 0 5px 10px',
    }),
    linePrimaryButton: css({
        "& > vscode-button": {
            color: "var(--button-primary-foreground)",
            backgroundColor: "var(--button-primary-background)",
            display: "flex",
            justifyContent: "center",
            height: "35px",
            width: "100%",
            borderRadius: "3px",
            "&:hover": {
                backgroundColor: "var(--vscode-button-hoverBackground)"
            }
        }
    }),
    doneButton: css({
        color: "var(--button-primary-foreground)",
        padding: "3px",
    }),
});
