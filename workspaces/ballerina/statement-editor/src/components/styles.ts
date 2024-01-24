/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { css } from "@emotion/css";
import { theme } from '@wso2-enterprise/ballerina-low-code-edtior-commons';

const syntaxHighlightingRules = {
    '& .type-descriptor, &.type-descriptor': {
        color: '#008080'
    },
    '& .numeric-literal, &.numeric-literal': {
        color: '#128bdf'
    },
    '& .string-literal, &.string-literal': {
        color: '#a31515'
    },
    '& .boolean-literal, &.boolean-literal': {
        color: '#dd0000'
    },
    '& .operator, &.operator': {
        color: '#0000ff'
    },
    '& .keyword, &.keyword': {
        color: '#0000ff'
    }
}

const hoverColor1 = {
    '&:hover': {
        backgroundColor: '#F0F1FB',
    }
}

const hoverColor2 = {
    '&.hovered': {
        backgroundColor: 'var(--vscode-list-inactiveSelectionBackground)'
    },
}

const focusColor1 = {
    '&:focus': {
        backgroundColor: 'rgba(204,209,242,0.61)'
    },
}

const activeColour = {
    '&:active': {
        backgroundColor: 'rgba(204,209,242,0.61)'
    },
}

const removePadding = {
    padding: '0px'
}

const stmtEditorPadding = {
    paddingLeft: '25px',
    paddingRight: '25px'
}

const statementFontStyles = {
    fontSize: "15px",
    'user-select': 'none',
    fontFamily: 'monospace'
}

const inputEditorTemplateStyles = {
    minWidth: '20px',
    letterSpacing: 0,
    position: 'relative' as 'relative',
    '&:focus': {
        outline: 'none'
    }
}

export const parameterHeader = {
    root: {
        fontSize: '13px',
        color: 'var(--vscode-editor-foreground)',
        letterSpacing: '0',
        lineHeight: '14px',
        paddingLeft: '0px',
        marginBottom: '7px',
        position: 'relative' as 'relative',
        width: '100%'
    }
}

const HEADER_FOOTER_HEIGHT = '105px';

export const useStatementEditorToolbarStyles = () => ({
    toolbar: css({
        display: 'flex',
        width: '100%',
        justifyContent: 'flex-start',
        borderBottom: '1px solid var(--vscode-panel-border)',
        paddingLeft: '17px'
    }),
    toolbarSet: css({
        border: '1px solid #e6e7ec',
        borderRadius: '8px',
        display: 'flex',
        marginLeft: '16px'
    }),
    toolbarOperators: css({
        display: 'flex',
        flexDirection: 'row',
        padding: 0,
        alignItems: 'center',
    }),
    toolbarIcons: css({
        padding: '8px',
        borderRadius: '5px',
        margin: '5px 0'
    }),
    toolbarOperatorsIcons: css({
        color: 'var(--foreground)',
        padding: '0px 8px',
        margin: '5px 0px'
    }),
    toolbarMoreExpIcon: css({
        color: 'var(--vscode-textLink-foreground)',
        fontWeight: 1000,
        fontFamily: 'monospace',
        fontSize: '12px',
        marginTop: '2px',
    }),
    undoRedoSeparator: css({
        width: '1px',
        borderRadius: '5px',
        boxShadow: 'inset 0 0 0 1px #E6E7EC'
    }),
    qualifierListItem: css({
        "& .MuiListItem-root": {
            padding: '0px',
            display: "inline-block"
        },
        "& .MuiListItemText-root": {
            minWidth: 'auto',
            margin: '0 0 0 12px'
        },
        ...removePadding
    }),
    QualifierCheckbox: css({
        float: 'right',
        marginRight: 0,
        color: '#40404B',
        padding: '3px 9px 0 0',
        "& .MuiCheckbox-colorSecondary.Mui-checked": {
            color: "#2FA86C"
        },
        "&$checked": {
            color: "#2FA86C",
            paddingLeft: '0px',
            "&:hover": {
                background: "transparent",
            },
            "& .MuiIconButton-label": {
                position: "relative"
            },
            "& .MuiIconButton-label::after": {
                content: '""',
                left: 1,
                top: 1,
                width: 19,
                height: 19,
                position: "absolute",
                backgroundColor: "#fff",
                zIndex: -1,
                borderRadius: 3,
            }
        },
    }),
    checked: css({}),
    QualifierDropdownBase: css({
        '& .MuiMenu-list': {
            width: "110px",
            border: "1px solid #DEE0E7",
            borderRadius: '5px'
        },
    }),
    toolbarDivider: css({
        borderLeft: '1px solid var(--vscode-panel-border)',
        height: "70%",
        alignSelf: "center",
        marginRight: '7px',
        marginLeft: '7px'
    })
});

export const useStatementRendererStyles = () => ({
    expressionBlock: css({
        position: 'relative',
        paddingRight: '10px',
        ...syntaxHighlightingRules
    }),
    expressionBlockDisabled: css({
        height: '24px',
        width: '15px',
        letterSpacing: 0,
        ...removePadding
    }),
    inputEditorTemplate: css({
        border: 'none',
        ...inputEditorTemplateStyles,
        ...statementFontStyles
    }),
    inputEditorEditingState: css({
        maxWidth: '120px',
        padding: "4px",
        '&:focus': { outline: 0, border: "1px solid var(--vscode-inputOption-activeBorder)" },
        background: "var(--vscode-editorHoverWidget-background)",
        color: 'var(--vscode-editor-foreground)',
        border: "1px solid transparent",
        letterSpacing: 0,
        ...statementFontStyles
    }),
    expressionElement: css({
        position: 'relative',
        width: 'fit-content',
        '&': {
            width: 'fit-content'
        },
        cursor: "pointer",
        ...syntaxHighlightingRules,
        ...hoverColor2
    }),
    expressionElementSelected: css({
        '&': {
            backgroundColor: 'var(--vscode-editor-selectionBackground)'
        },
        '&.hovered': {
            backgroundColor: 'var(--vscode-list-hoverBackground)',
        },
        '&:focus-within': {
            backgroundColor: 'var(--vscode-list-activeSelectionBackground)'
        },
        '&.hovered:focus-within:': {
            backgroundColor: 'transparent',
        },
        ...hoverColor2
    }),
    syntaxErrorElementSelected: css({
        '&': {
            boxSizing: 'border-box',
            height: '25px',
            weight: '75px',
            border: '1px solid #FE523C',
            borderRadius: '2px',
            backgroundColor: '#FCEDED',
            boxShadow: '0 1px 4px 0 rgba(0,0,0,0.11)',
            color: '#FE523C',
        },
        '&:focus-within': {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            border: 'none'
        }
    }),
    addNewExpressionButton: css({
        backgroundColor: '#f7f8fb',
        border: '#6830e9',
        borderStyle: 'solid',
        color: '#6830e9',
        textAlign: 'center',
        fontSize: '16px',
        margin: '4px 2px',
        borderRadius: '50%'
    }),
    libraryDropdown: css({
        flex: '0 0 50%',
        display: 'flex',
        justifyContent: 'flex-end'
    }),
    rhsComponent: css({
        position: 'relative',
        top: '10px',
        width: '90%',
        marginLeft: '5%'
    }),
    propertyDivider: css({
        height: '1px',
        marginTop: '2%',
        marginBottom: '10px',
        width: '94%',
        opacity: 0.52,
        backgroundColor: '#DCDEE4'
    }),
    buttonWrapper: css({
        height: 'auto',
        display: 'flex',
        justifyContent: 'flex-end',
        width: '100%',
        zIndex: 100,
    }),
    plusIcon: css({
        boxSizing: 'border-box',
        border: '1px dashed #A6B3FF',
        borderRadius: '4px',
        position: 'relative',
        width: 'fit-content',
        backgroundColor: '#F0F1FB',
        fontFamily: "monospace",
        color: '#0095FF',
        margin: '0px 2px',
        padding: '0px 4px',
        '&:hover': {
            backgroundColor: 'rgba(173, 214, 255, 0.3)'
        },
        '&.modifiable': {
            position: 'absolute',
            marginLeft: '10px',
        },
        '&.view': {
            display: "inline"
        },
        '&.hide': {
            visibility: "hidden"
        }
    }),
    errorHighlight: css({
        backgroundImage: `linear-gradient(45deg, transparent 65%, red 80%, transparent 90%),
            linear-gradient(135deg, transparent 5%, red 15%, transparent 25%),
            linear-gradient(135deg, transparent 45%, red 55%, transparent 65%),
            linear-gradient(45deg, transparent 25%, red 35%, transparent 50%)`,
        backgroundRepeat: "repeat-x",
        backgroundSize: "8px 2px",
        backgroundPosition: "0 95%"
    }),
    syntaxErrorTooltip: css({
        position: 'absolute',
        top: '-26px',
        left: '80%'
    })
});

export const useStatementEditorDiagnosticStyles = () => ({
    diagnosticsPane: css({
        maxHeight: '125px',
        overflowY: 'scroll',
        marginRight: '-25px',
        color: '#ea4c4d',
        paddingTop: '13px',
        width: '100%',
        "& .MuiList-padding": {
            ...removePadding
        },
        "& .MuiListItemText-root": {
            margin: '0px'
        }
    }),
    diagnosticsErrorIcon: css({
        padding: '4px 6px 0 0'
    }),
});

export const useStmtEditorHelperPanelStyles = () => ({
    tabPanelWrapper: css({
        display: 'flex',
        flexDirection: 'row',
        zIndex: 1,
    }),
    libraryTypeSelector: css({
        height: '48px',
        marginLeft: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end'
    }),
    suggestionsInner: css({
        overflowY: 'hidden',
        height: '100%',
        width: '100%'
    }),
    tabsPanelSe: css({
        "& .MuiTab-wrapper": {
            textTransform: 'none',
            fontWeight: 'normal'
        },
        "& .MuiTab-root": {
            marginRight: '24px',
            minWidth: 'fit-content',
            fontSize: '13px',
            ...removePadding
        },
        "& .MuiTab-textColorInherit": {
            color: '#8D91A3'
        },
        "& .MuiTab-textColorInherit.Mui-selected": {
            opacity: 1,
            color: 'var(--vscode-tab-activeForeground)'
        },
        "& .MuiTabs-indicator": {
            backgroundColor: 'var(--vscode-button-background)',
            height: '2px'
        },
        "& .MuiTabs-scroller": {
            height: '48px'
        }
    }),
    suggestionListContainer: css({
        height: 'inherit',
        "& .MuiList-padding": {
            ...removePadding
        }
    }),
    suggestionList: css({
        columnGap: '5%',
        display: 'grid',
        gridTemplateColumns: '30% 30% 30%',
        "& .MuiListItem-root": {
            padding: '7px 10px'
        },
    }),
    suggestionListItem: css({
        "& .MuiListItemText-root": {
            margin: '0'
        },
        ...hoverColor1,
        ...activeColour
    }),
    suggestionDataType: css({
        color: '#05A26B',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontSize: '13px',
        marginLeft: '4px',
    }),
    suggestionValue: css({
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontSize: '13px',
    }),
    suggestionListInner: css({
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
    }),
    expressionExample: css({
        fontSize: '13px',
    }),
    searchBox: css({
        width: '100%',
        padding: '0 25px'
    }),
    librarySearchBox: css({
        position: 'relative',
        height: '32px',
        width: 'inherit',
        // "var(--vscode-editorInfo-foreground)"
        border: '1px var(--custom-input-border-color)',
        // borderRadius: '5px',
        // boxShadow: 'inset 0 0 0 1px #DEE0E7, inset 0 2px 1px 0 rgba(0,0,0,0.07), 0 0 0 0 rgba(50,50,77,0.07)',
        color: '#8D91A3',
        textIndent: '12px',
        textAlign: 'left',
        marginBottom: '16px',
        paddingLeft: '10px'
    }),
    helperPaneSubHeader: css({
        color: 'var(--vscode-editor-foreground)',
        marginBottom: '4px',
        fontWeight: 500,
        paddingLeft: '10px'
    }),
    groupHeaderWrapper: css({
        display: 'flex',
        flexDirection: 'row',
        marginBottom: '14px'
    }),
    selectionWrapper: css({
        display: 'flex',
        flexDirection: 'row',
        marginTop: '5px'
    }),
    suggestionDividerWrapper: css({
        marginTop: '5px',
        marginLeft: '10px'
    }),
    groupHeader: css({
        color: 'var(--vscode-editor-foreground)',
        fontWeight: 500,
        marginLeft: '10px',
        marginRight: '5px',
    }),
    selectionSubHeader: css({
        color: 'var(--vscode-settings-textInputForeground)',
        borderRadius: '5px',
        backgroundColor: 'var(--vscode-editor-selectionBackground)',
        marginLeft: '10px',
        marginRight: '5px',
        ...statementFontStyles
    }),
    selectionSeparator: css({
        height: '1px',
        width: '100%',
        flex: '1 0',
        backgroundColor: 'var(--vscode-panel-border)',
        alignSelf: 'flex-end'
    }),
    expressionList: css({
        columnGap: '5%',
        display: 'grid',
        gridTemplateColumns: '30% 30% 30%',
        "& .MuiListItem-root": {
            marginBottom: '8px',
            padding: '0 10px',
            width: 'fit-content'
        },
        ...removePadding
    }),
    expressionListItem: css({
        width: '100px',
        "& .MuiListItemText-root": {
            margin: '0'
        },
        ...hoverColor1,
        ...activeColour
    }),
    loadingContainer: css({
        height: '60vh',
        alignContent: 'center',
        alignItems: 'center',
    }),
    libraryWrapper: css({
        height: 'calc(100vh - 335px)',
        paddingLeft: '15px',
        paddingRight: '25px',
        overflowY: 'scroll',
    }),
    libraryBrowser: css({
        height: '100%',
        "& .MuiListItem-root": {
            padding: '6px 10px'
        },
        "& .MuiIconButton-root": {
            ...removePadding
        }
    }),
    libraryBrowserHeader: css({
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        zIndex: 1,
        color: 'var(--vscode-sideBar-foreground)',
        ...stmtEditorPadding
    }),
    searchResult: css({
        paddingTop: '15px',
    }),

    moduleTitle: css({
        fontSize: '14px',
        margin: '0 10px'
    }),
    libraryReturnIcon: css({
        marginRight: '8px'
    }),
    arrowBack: css({
        color: '#5567D5'
    }),
    libraryModuleIcon: css({
        marginLeft: '8.25px',
        marginBottom: '12px'
    }),
    libraryListBlock: css({
        paddingBottom: '50px',
        columnGap: '5%',
        display: 'grid',
        gridTemplateColumns: '28% 28% 28%',
        ...removePadding
    }),
    libraryElementBlockContent: css({
        top: '10%',
        height: '80%',
        overflowY: 'hidden',
        columnGap: '6%',
        display: 'grid',
        gridTemplateColumns: '29% 29% 29%'
    }),
    libraryElementBlock: css({
        top: '5%',
        display: 'flex',
        flexDirection: 'column'
    }),
    libraryElementBlockLabel: css({
        height: '10%',
        padding: '0 10px'
    }),
    parameterCheckbox: css({
        margin: '0px'
    }),
    parameterTabCheckBox: css({
        root: {
            "&$checked": {
                color: "rgba(0, 0, 0, 0.54)"
            }
        }
    }),
    checked: css({}),
    disabledCheckbox: css({
        alignSelf: "flex-start",
        color: 'rgba(47,168,108,0.5)',
        padding: '3px 6px 0 0',
        "&$checked": {
            color: "rgba(47,168,108,0.5)",
            "&:hover": {
                background: "transparent",
            },
            "& .MuiIconButton-label": {
                position: "relative",
            },
            "& .MuiIconButton-label::after": {
                content: '""',
                left: 1,
                top: 1,
                width: 19,
                height: 19,
                position: "absolute",
                backgroundColor: "#fff",
                zIndex: -1,
                borderRadius: 3,
            }
        }
    }),
    docParamSuggestions: css({
        height: '100%',
        overflowY: 'scroll',
        ...stmtEditorPadding
    }),
    returnSeparator: css({
        height: '1px',
        opacity: '0.52',
        backgroundColor: 'var(--vscode-panel-border)',
        marginBottom: '15px'
    }),
    docListItemText: css({
        "& .MuiListItem-root": {
            padding: '0px'
        },
        "& .MuiListItemText-root": {
            flex: "none"
        },
        ...removePadding
    }),
    docParamDescriptionText: css({
        flex: "inherit",
        ...removePadding
    }),
    includedRecordPlusBtn: css({
        display: 'block',
        alignSelf: 'center',
        padding: '0px',
        marginLeft: '10px'
    }),
    paramHeader: css({
        marginTop: '0px',
        color: 'var(--vscode-editor-foreground)'
    }),
    paramDataType: css({
        marginLeft: '8px',
        marginRight: '8px',
        flex: 'inherit',
        ...removePadding
    }),
    requiredArgList: css({
        display: 'flex',
        alignItems: 'flex-start',
        overflowX: 'hidden',
        width: 'fit-content',
        ...removePadding
    }),
    docDescription: css({
        maxHeight: '50%',
        overflowY: 'scroll',
        whiteSpace: 'break-spaces',
        display: 'block',
        margin: '10px 0px',
        ...removePadding
    }),
    returnDescription: css({
        maxHeight: '15%',
        overflowY: 'scroll',
        whiteSpace: 'break-spaces',
        "& .MuiListItem-root": {
            paddingLeft: '0px'
        },
        ...removePadding
    }),
    paramList: css({
        overflowY: 'auto',
        margin: '10px 0px',
    }),
    documentationWrapper: css({
        marginLeft: '28px',
    }),
    includedRecordHeaderList: css({
        "& .MuiListItem-root": {
            padding: '0px',
            alignItems: 'flex-start'
        },
        "& .MuiListItemText-root": {
            flex: "inherit"
        },
        ...removePadding
    }),
    docListDefault: css({
        "& .MuiListItem-root": {
            padding: '0px'
        },
        "& .MuiListItemText-root": {
            flex: 'inherit',
            minWidth: 'auto',
            margin: '0 6px 0 0'
        },
        alignItems: 'flex-start',
        width: 'fit-content',
        ...removePadding
    }),
    docListCustom: css({
        marginBottom: '12px',
        "& .MuiListItem-root": {
            padding: '0px'
        },
        "& .MuiListItemText-root": {
            flex: 'inherit',
            minWidth: 'auto',
            margin: '0 6px 0 0'
        },
        alignItems: 'flex-start',
        width: 'fit-content',
        ...removePadding
    }),
    exampleHeader: css({
        fontSize: '13px',
        color: 'var(--vscode-editor-foreground)',
        letterSpacing: '0',
        lineHeight: '14px',
        paddingLeft: '0px',
        marginBottom: '7px',
        marginTop: '20px'
    }),
    exampleCode: css({
        display: 'flex',
        padding: '5px',
        fontFamily: 'monospace',
        borderRadius: '0px'
    }),
    paramTreeList: css({
        display: 'flex',
        alignItems: 'flex-start'
    }),
    paramTreeDescriptionText: css({
        flex: "inherit",
        whiteSpace: 'pre-wrap',
        marginLeft: '24px',
        color: theme.palette.text.secondary,
        ...removePadding
    }),
    listItemMultiLine: css({
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        minHeight: '32px'
    }),
    listItemHeader: css({
        display: 'flex',
        alignItems: 'flex-start',
        height: '28px'
    }),
    listItemBody: css({
        marginLeft: '12px',
        marginBottom: '8px',
        paddingLeft: '16px',
        borderLeft: "1px solid #d8d8d8",
    }),
    listDropdownWrapper: css({
        width: '200px',
    }),
    listOptionalWrapper: css({
        display: 'flex',
        alignItems: 'center',
        height: '32px',
        marginBottom: '12px'
    }),
    listOptionalBtn: css({
        textTransform: 'none',
        minWidth: '32px',
        color: theme.palette.primary.main
    }),
    listOptionalHeader: css({
        fontSize: '13px',
        color: theme.palette.text.secondary,
        fontWeight: 500,
        letterSpacing: '0',
        lineHeight: '14px',
        paddingLeft: '0px',
    }),
    listSelectDropDown: css({
        height: '24px',
        borderRadius: 4,
        background: "linear-gradient(180deg, #FFFFFF 0%, #F7F7F9 100%)",
        boxShadow: "inset 0 0 0 1px #DEE0E7, 0 1px 2px -1px rgba(0,0,0,0.08)",
        cursor: "pointer",
        width: "inherit",
        "&:active": {
            background: "linear-gradient(180deg, #ffffff 0%, #f7f7f9 100%)",
            boxShadow: "inset 0 0 0 1px #a6b3ff, 0 1px 1px 0 rgba(0, 0, 0, 0.06)",
            border: "1px solid #5567d5",
        },
        "&:focused": {
            background: "linear-gradient(180deg, #ffffff 0%, #f7f7f9 100%)",
            boxShadow: "inset 0 0 0 1px #a6b3ff, 0 1px 1px 0 rgba(0, 0, 0, 0.06)",
            border: "1px solid #5567d5 !important"
        },
        '& .MuiSelect-icon': {
            marginRight: 11,
        },
        "& .MuiSelect-selectMenu": {
            height: "inherit !important",
            paddingLeft: 10,
            "& .TextSpan": {
                top: "calc(50% - 8px)",
                position: "absolute",
                maxWidth: "156px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
            }
        },
        "& .MuiSelect-select.MuiSelect-select": {
            padding: "0 0 0 10px",
            minWidth: "100px"
        },
        "& .MuiSelect-select.MuiSelect-select:focus": {
            backgroundColor: "transparent"
        }
    }),
});

export const useStatementEditorStyles = () => ({
    mainStatementWrapper: css({
        display: 'flex',
        height: 'auto',
        flexDirection: 'column',
    }),
    stmtEditorInnerWrapper: css({
        fontSize: '13px',
        overflowY: 'hidden',
        paddingTop: '0px',
        ...stmtEditorPadding
    }),
    sourceEditor: css({
        fontSize: '13px',
        fontFamily: 'Gilmer',
        overflowY: 'hidden',
        padding: '0px 10px 0px 10px',
        margin: '0px 10px'
    }),
    statementExpressionWrapper: css({
        height: 'calc(100vh - ' + HEADER_FOOTER_HEIGHT + ')',
        '&.overlay': {
            display: 'block',
            position: 'relative',
            backgroundColor: '#fff',
            opacity: '0.7',
            zIndex: -1
        },
        overflowY: 'hidden',
        display: 'flex',
        flexDirection: 'column'
    }),
    loadingWrapper: css({
        height: 'calc(100vh - 110px)',
        '&.overlay': {
            display: 'block',
            position: 'relative',
            backgroundColor: '#fff',
            opacity: '0.7',
            zIndex: -1
        },
        overflowY: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    }),
    sectionLoadingWrapper: css({
        height: '18vh',
        '&.overlay': {
            display: 'block',
            position: 'relative',
            backgroundColor: '#fff',
            opacity: '0.7',
            zIndex: -1
        },
        overflowY: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    }),
    suggestionsSection: css({
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        height: 'inherit'
    }),
    stmtEditorContentWrapper: css({
        backgroundColor: 'var(--vscode-editor-background)',
        display: 'flex',
        flexDirection: 'column',
        padding: "0px 0px 8px 0px",
        borderBottom: '1px solid var(--vscode-panel-border)'
    }),
    statementExpressionTitle: css({
        display: 'flex',
        alignItems: 'center',
        fontWeight: 500
    }),
    statementExpressionContent: css({
        maxHeight: '275px',
        overflowY: 'scroll',
        marginRight: '-25px',
        paddingTop: '25px',
        paddingBottom: '10px',
        width: '100%',
        ...statementFontStyles
    }),
    footer: css({
        height: 'auto',
        display: 'flex',
        width: '100%',
        padding: '10px 25px',
        borderTop: '1px solid var(--vscode-panel-border)'
    }),
    buttonWrapper: css({
        display: 'flex',
        justifyContent: 'flex-end',
        width: '100%',
        gap: '10px'
    }),
    stmtEditorToggle: css({
        width: '50%'
    }),
    separatorLine: css({
        height: '1px',
        opacity: '0.52',
        backgroundColor: 'var(--vscode-panel-border)',
        marginBottom: '25px',
        marginLeft: '10px'
    }),
    stmtEditorExpressionWrapper: css({
        padding: '0 15px 15px 15px',
        marginTop: '15px',
        height: 'inherit',
        overflowY: 'scroll'
    }),
    helpText: css({
        fontStyle: "italic"
    }),
    editorsBreadcrumb: css({
        width: '90%',
        '& > * + *': {
            marginTop: theme.spacing(2),
        },
    }),
    statementEditorHeader: css({
        minHeight: '5vh',
        display: 'flex',
        borderBottom: 'solid 1px #d8d8d8',
        padding: theme.spacing(1.5),
        ...stmtEditorPadding
    }),
    closeButton: css({
        display: 'flex',
        justifyContent: 'flex-end',
        width: '10%'
    }),
    help: css({
        paddingRight: '24px',
        display: "flex"
    }),
    helpLink: css({
        marginLeft: '8px',
        color: '#5567D5',
        "&:hover": {
            cursor: "pointer"
        }
    }),
    docButton: css({
        alignItems: "center",
        display: "flex"
    })
});
