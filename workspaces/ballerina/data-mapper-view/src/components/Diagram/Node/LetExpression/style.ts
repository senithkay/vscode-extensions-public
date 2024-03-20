/**
 * Copyright (c) 2020, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { css } from '@emotion/css';

export const useStyles = () => ({
    addIcon: css({
        "& > vscode-button": {
            color: "var(--vscode-inputOption-activeForeground)",
            backgroundColor: "var(--vscode-sideBar-background)",
            textTransform: "none",
            display: "flex",
            justifyContent: "space-between",
            fontStyle: "normal",
            fontWeight: 400,
            fontSize: "13px",
            lineHeight: "24px",
            height: "40px",
            border: "1px solid var(--vscode-welcomePage-tileBorder)",
        },
        "& > vscode-button > *": {
            margin: "0px 6px"
        }
    }),
    typeLabel: css({
        marginLeft: "3px",
        verticalAlign: "middle",
        padding: "5px",
        minWidth: "100px",
        marginRight: "24px"
    }),
    treeLabelPortSelected: css({
        color: "var(--vscode-list-activeSelectionForeground)",
        backgroundColor: 'var(--vscode-list-activeSelectionBackground)',
        outline: "1px solid var(--vscode-list-focusAndSelectionOutline, var(--vscode-contrastActiveBorder, var(--vscode-list-focusOutline)))",
        "&:hover": {
            backgroundColor: 'var(--vscode-list-activeSelectionBackground)'
        }
    }),
    valueLabel: css({
        verticalAlign: "middle",
        padding: "5px",
    }),
    treeLabelOutPort: css({
        float: "right",
        width: 'fit-content',
        marginLeft: "auto",
        display: "flex",
        alignItems: "center"
    }),
    treeLabelInPort: css({
        float: "left",
        width: 'fit-content',
        display: "flex",
        alignItems: "center"
    }),
    label: css({
        width: "300px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        textOverflow: "ellipsis",
        "&:hover": {
            overflow: "visible"
        }
    }),
    expandIcon: css({
        color: "var(--vscode-inputOption-activeForeground)",
        height: "25px",
        width: "25px"
    }),
    queryPortWrap: css({
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center'
    }),
    gotoExprIcon: css({
        color: "var(--vscode-input-placeholderForeground)",
        cursor: 'pointer'
    })
});
