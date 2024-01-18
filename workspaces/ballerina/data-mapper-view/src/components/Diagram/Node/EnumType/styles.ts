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
    typeLabel: css({
        marginLeft: "3px",
        verticalAlign: "middle",
        padding: "5px",
        minWidth: "100px",
        marginRight: "24px"
    }),
    treeLabelPortSelected: css({
        backgroundColor: "var(--vscode-editorWidget-background)"
    }),
    valueLabel: css({
        verticalAlign: "middle",
        padding: "5px"
    }),
    treeLabelOutPort: css({
        float: "right",
        width: "fit-content",
        marginLeft: "auto",
        display: "flex",
        alignItems: "center"
    }),
    treeLabelInPort: css({
        float: "left",
        width: "fit-content",
        display: "flex",
        alignItems: "center"
    }),
    label: css({
        width: "300px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        display: "inline-block",
        textOverflow: "ellipsis",
        "&:hover": {
            overflow: "visible"
        }
    }),
    expandIcon: css({
        color: "var(--vscode-inputOption-activeForeground)",
        height: "25px",
        width: "25px",
        marginLeft: "auto"
    }),
    queryPortWrap: css({
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center"
    }),
    treeLabel: css({
        verticalAlign: "middle",
        padding: "5px",
        minWidth: "100px",
        display: "flex",
        minHeight: "24px",
        background: "var(--vscode-input-background)",
        '&:hover': {
            backgroundColor: 'var(--vscode-tab-inactiveBackground)'
        }
    }),
    headerTreeLabel: css({
        verticalAlign: "middle",
        padding: "5px",
        minWidth: "100px",
        display: "flex",
        minHeight: "24px",
        backgroundColor: "var(--vscode-editorWidget-background)"
    }),
    treeLabelParentHovered: css({
        backgroundColor: 'var(--vscode-list-hoverBackground)'
    })
});