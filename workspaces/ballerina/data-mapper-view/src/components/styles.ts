/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { css } from "@emotion/css";
import { IO_NODE_DEFAULT_WIDTH, IO_NODE_FIELD_HEIGHT } from "./Diagram/utils/constants";

const typeLabel = {
    marginLeft: "3px",
    marginRight: "24px",
    padding: "5px",
    minWidth: "100px",
    color: "inherit",
    verticalAlign: "middle",
};

const addElementButton = {
    color: "var(--vscode-inputOption-activeForeground)",
    display: "flex",
    justifyContent: "space-between",
    fontStyle: "normal",
    fontWeight: 400,
    fontSize: "13px",
    lineHeight: "24px",
};

const treeLabel = {
    verticalAlign: "middle",
    padding: "5px",
    minWidth: "100px",
    display: "flex",
    width: "100%",
    height: `${IO_NODE_FIELD_HEIGHT}px`,
    '&:hover': {
        backgroundColor: 'var(--vscode-list-hoverBackground)',
    },
};

export const useIONodesStyles = () => ({
    inputTypeLabel: css({
        ...typeLabel
    }),
    outputTypeLabel: css({
        fontSize: "13px",
        fontWeight: 400,
        ...typeLabel
    }),
    valueLabel: css({
        padding: "5px",
        fontWeight: 600,
        fontSize: "13px",
        color: "inherit",
        verticalAlign: "middle",
    }),
    inPort: css({
		float: "left",
		marginRight: "5px",
		width: 'fit-content',
		display: "flex",
		alignItems: "center"
	}),
    outPort: css({
        float: "right",
        width: 'fit-content',
        marginLeft: "auto",
        display: "flex",
        alignItems: "center"
    }),
    label: css({
        display: "flex",
        alignItems: "center",
        width: "300px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        color: "inherit",
        "&:hover": {
            overflow: "visible"
        },
    }),
    queryPortWrap: css({
        width: IO_NODE_DEFAULT_WIDTH,
        position: "absolute"
    }),
    nodeType: css({
        float: 'right',
        marginRight: 5,
        color: "var(--vscode-pickerGroup-border)",
    }),
    treeLabelDisableHover: css({
        '&:hover': {
            backgroundColor: 'var(--vscode-input-background)',
        },
        opacity: 0.8
    }),
    treeLabelDisabled: css({
        cursor: 'not-allowed',
        opacity: 0.5
    }),
    header: css({
		color: "black",
		backgroundColor: "var(--vscode-editor-inactiveSelectionBackground)",
		display: "flex",
		height: "40px",
		padding: "8px"
	}),
    boldedTypeLabel: css({
		fontWeight: 800,
		fontSize: "14px",
	}),
    labelDisabled: css({
		opacity: 0.5
	}),
    treeLabelPortSelected: css({
        color: "var(--vscode-list-activeSelectionForeground)",
        backgroundColor: 'var(--vscode-list-activeSelectionBackground)',
        outline: "1px solid var(--vscode-list-focusAndSelectionOutline, var(--vscode-contrastActiveBorder, var(--vscode-list-focusOutline)))",
        "&:hover": {
            backgroundColor: 'var(--vscode-list-activeSelectionBackground)'
        }
    }),
    treeLabelParentHovered: css({
        backgroundColor: 'var(--vscode-list-hoverBackground)',
    }),
    treeLabelArray: css({
        ...treeLabel,
        height: 'fit-content',
        flexDirection: "column"
    }),
    ArrayFieldRow: css({
        display: "flex",
        alignItems: 'center',
        '&:hover': {
            backgroundColor: 'inherit',
        }
    }),
    ArrayFieldRowDisabled: css({
        cursor: 'not-allowed',
        opacity: 0.5
    }),
    innerTreeLabel: css({
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        width: "inherit",
        padding: "10px 12px",
        margin: "10px",
        flex: "none",
        order: 1,
        flexGrow: 0
    }),
    outputNodeValue: css({
        verticalAlign: "middle",
        padding: "5px",
        backgroundColor: "var(--vscode-input-background)",
        borderRadius: "5px",
        cursor: 'pointer',
        pointerEvents: 'auto',
        transition: 'border 0.2s',
        border: `1px solid var(--vscode-input-background)`,
        '&:hover': {
            border: "1px solid var(--vscode-pickerGroup-border)"
        }
    }),
    addArrayElementButton: css({
        "& > vscode-button": {
            padding: "5px",
            textTransform: "none",
            ...addElementButton
        },
        "& > vscode-button > *": {
            margin: "0px 6px"
        }
    }),
    addLocalVariableButton: css({
        "& > vscode-button": {
            height: "40px",
            width: `${IO_NODE_DEFAULT_WIDTH}px`,
            border: "none",
        },
        "& > vscode-button > *": {
            margin: "0px 6px"
        }
    }),
    requiredMark: css({
        color: "var(--vscode-errorForeground)",
        margin: '0 2px',
        fontSize: '13px'
    }),
    treeLabel: css({
        ...treeLabel
    }),
    enumHeaderTreeLabel: css({
        verticalAlign: "middle",
        padding: "5px",
        minWidth: "100px",
        display: "flex",
        minHeight: "24px",
        backgroundColor: "var(--vscode-sideBar-background)"
    }),
    gotoExprIcon: css({
        color: "var(--vscode-input-placeholderForeground)",
        cursor: 'pointer'
    })
});

export const useIntermediateNodeStyles = () => ({
    root: css({
        width: '100%',
        backgroundColor: "var(--vscode-sideBar-background)",
        padding: "2px",
        borderRadius: "2px",
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        color: "var(--vscode-checkbox-border)",
        alignItems: "center",
        border: "1px solid var(--vscode-welcomePage-tileBorder)",
    }),
    element: css({
        backgroundColor: 'var(--vscode-input-background)',
        padding: '5px',
        cursor: 'pointer',
        transitionDuration: '0.2s',
        userSelect: 'none',
        pointerEvents: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        '&:hover': {
            filter: 'brightness(0.95)',
        },
    }),
    header: css({
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        "& > *": {
            margin: "0 2px"
        }
    }),
    loadingContainer: css({
        padding: "10px"
    })
});

export const useUnionTypeNodeStyles = () => ({
    selectTypeWrap: css({
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        width: "inherit",
        padding: "10px",
        background: "var(--vscode-sideBar-background)",
        borderRadius: "4px"
    }),
    unionTypesList: css({
        columnGap: '5%',
        display: 'grid',
        gridTemplateColumns: '100%',
        width: 'inherit',
        "& .MuiListItem-root": {
            marginBottom: '8px',
            padding: '0 10px'
        }
    }),
    unionTypeListItem: css({
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        '&:hover': {
            backgroundColor: 'var(--vscode-list-hoverBackground)',
        },
        '&:active': {
            backgroundColor: 'rgba(204,209,242,0.61)'
        }
    }),
    unionTypeValue: css({
        color: "var(--vscode-foreground)",
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    }),
    warningContainer: css({
        display: 'flex',
        alignItems: 'center'
    }),
    warningText: css({
        color:  'var(--vscode-errorForeground)',
        fontSize: '15px',
        fontFamily: 'Droid Sans Mono',
        fontWeight: 'normal'
    }),
});
