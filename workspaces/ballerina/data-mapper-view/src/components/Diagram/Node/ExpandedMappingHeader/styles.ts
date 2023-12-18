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
    clauseItem: css({
        width: "100%",
        minWidth: "200px",
        display: "flex",
        alignItems: "center",
        "&:hover": {
            color: "var(--vscode-inputOption-activeForeground)",
            "& $deleteIcon": {
                opacity: 1
            }
        }
    }),
    lineWrap: css({
        width: "80px",
        height: "25px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
        flexDirection: "column"
    }),
    line: css({
        height: "6px",
        width: "2px",
        background: "var(--vscode-input-background)"
    }),
    clauseKeyWrap: css({
        border: "1px solid var(--vscode-input-background)",
        borderRadius: "8px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "26px 0",
        background: "var(--vscode-editorWidget-background)",
        width: "80px",
        textAlign: "center",
        fontWeight: "bold"
    }),
    fromClauseKeyWrap: css({
        border: "1px solid var(--vscode-pickergroup-border)"
    }),
    clauseWrap: css({
        background: "white",
        borderRadius: "8px",
        height: "40px",
        marginLeft: "25px",
        marginRight: "10px",
        display: "flex",
        alignItems: "center",
        padding: "26px 10px",
        boxShadow: "0px 5px 50px rgba(203, 206, 219, 0.5)",
        "&:hover": {
            "& $addOrderKeyIcon": {
                opacity: 0.7
            }
        }
    }),
    buttonWrapper: css({
        border: "1px solid var(--vscode-editorwidget-background)",
        borderRadius: "8px",
        right: "35px"
    }),
    clauseItemKey: css({
        marginLeft: "5px"
    }),
    clauseExpressionLight: css({
        marginLeft: "5px",
        marginRight: "5px",
        display: "flex",
        alignItems: "center",
        transition: "background 0.2s",
        "&:hover": {
            background: "var(--vscode-editorHoverWidget-background)",
            "& $deleteOrderKeyIcon": {
                opacity: 0.7
            }
        }
    }),
    clauseExpression: css({
        background: "var(--vscode-editorHoverWidget-background)",
        borderRadius: "5px",
        cursor: "pointer",
        padding: "5px",
        marginLeft: "5px",
        marginRight: "5px",
        transition: "border 0.2s",
        border: "1px solid transparent",
        width: "max-content",
        '&:hover': {
            border: "1px solid var(--vscode-pickerGroup-border)"
        }
    }),
    clauseDiagnostics: css({
        background: "var(--vscode-inputValidation-errorBackground)",
        "&:hover": {
            border: "1px solid var(--vscode-errorForeground)"
        }
    }),
    errorIconWrapper: css({
        height: "22px",
        width: "22px",
        marginLeft: '5px',
        verticalAlign: 'middle',
    }),
    clausePlaceholder: css({
        background: 'var(--vscode-debugIcon-breakpointCurrentStackframeForeground)',
        "&:hover": {
            border: `1px solid var(--vscode-editorWarning-foreground)`
        }
    }),
    addIcon: css({
        cursor: 'pointer',
        fontSize: '18px',
        color: 'var(--vscode-editorInfo-foreground)',
        transition: 'all 0.2s',
        "&:hover": {
            color: 'var(--vscode-textLink-foreground)',
        }
    }),
    deleteIcon: css({
        cursor: 'pointer',
        color: "var(--vscode-errorForeground)",
        fontSize: '20px',
        transition: 'all 0.2s ease-in-out',
        opacity: 0,
        "&:hover": {
            color: "var(--vscode-inputValidation-errorBorder)",
        }
    }),
    deleteOrderKeyIcon: css({
        cursor: 'pointer',
        color: "var(--vscode-errorForeground)",
        fontSize: '20px',
        transition: 'opacity 0.2s ease-in-out',
        opacity: 0,
        paddingRight: 5,
        "&:hover": {
            opacity: 1,
            color: "var(--vscode-inputValidation-errorBorder)",
        }
    }),
    addOrderKeyIcon: css({
        cursor: 'pointer',
        color: "var(--vscode-input-placeholderForeground)",
        fontSize: '20px',
        transition: 'opacity 0.2s ease-in-out',
        opacity: 0,
        paddingRight: 5,
        "&:hover": {
            opacity: 1,
            color: "var(--vscode-icon-foreground)",
        }
    }),
    input: css({
        maxWidth: '120px',
        padding: "5px",
        border: 0,
        "&:hover": { outline: 0 },
        "&:focus": { outline: 0 },
        background: 'transparent'
    }),
    addButtonWrap: css({
        position: 'absolute',
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        top: 0,
    }),
    queryInputInputPortWrap: css({
        width: 80,
        display: 'flex',
        justifyContent: 'center'
    }),
    addMenu: css({
        marginLeft: 5,
        marginTop: 10,
        "& .MuiMenuItem-root": {
            fontSize: '11px',
            paddingBottom: "1px",
            paddingTop: "1px"
        }
    }),
    orderSelect: css({
        '& .MuiSelect-select:focus': {
            backgroundColor: 'unset',
        },
        background: "var(--vscode-editorHoverWidget-background)",
        borderRadius: 5,
        cursor: 'pointer',
        paddingLeft: 5,
        paddingRight: 5,
        marginLeft: 5,
        marginRight: 5,
        transition: 'border 0.2s',
        border: `1px solid transparent`,
        '&:hover': {
            border: "1px solid var(--vscode-pickerGroup-border)"
        }
    })
});