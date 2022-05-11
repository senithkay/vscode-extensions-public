/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: ordered-imports
import { createStyles, makeStyles } from '@material-ui/core/styles';
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
        backgroundColor: '#e5ebf1'
    },
}

const focusColor1 = {
    '&:focus': {
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
export const useStatementEditorToolbarStyles = makeStyles(() =>
    createStyles({
        toolbar: {
            display: 'flex',
            width: '100%',
            justifyContent: 'flex-end'
        },
        toolbarSet: {
            border: '1px solid #e6e7ec',
            borderRadius: '8px',
            display: 'flex',
            marginLeft: '16px'
        },
        toolbarIcons: {
            padding: '8px',
            ...hoverColor1
        },
        undoRedoSeparator: {
            width: '1px',
            borderRadius: '5px',
            boxShadow: 'inset 0 0 0 1px #E6E7EC'
          }
    }),
);

export const useStatementRendererStyles = makeStyles(() =>
    createStyles({
        expressionBlock: {
            position: 'relative',
            paddingRight: '10px',
            ...syntaxHighlightingRules
        },
        expressionBlockDisabled: {
            height: '24px',
            width: '15px',
            letterSpacing: 0,
        },
        inputEditorTemplate: {
            minWidth: '20px',
            letterSpacing: 0,
            position: 'relative',
            border: 'none',
            '&:focus': {
                outline: 'none'
            }
        },
        expressionElement: {
            position: 'relative',
            width: 'fit-content',
            marginRight: '2px',
            '&': {
                width: 'fit-content',
                borderRadius: '4px',
            },
            cursor: "pointer",
            ...syntaxHighlightingRules,
            ...hoverColor2
        },
        expressionElementSelected: {
            '&': {
                backgroundColor: '#ccd1f29c'
            },
            ...hoverColor2
        },
        plusIcon: {
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
                '&.lastElement': {
                    marginLeft: '250px',
                    marginTop: '-20px'
                }
            }
        },
    }),
);

export const useStatementEditorDiagnosticStyles = makeStyles(() =>
    createStyles({
        diagnosticsPane: {
            color: '#ea4c4d',
            paddingTop: '13px',
            "& .MuiList-padding": {
                ...removePadding
            },
            "& .MuiListItemText-root": {
                margin: '0px'
            }
        },
        diagnosticsErrorIcon: {
            padding: '4px 6px 0 0'
        },
    }),
);

export const useStmtEditorHelperPanelStyles = makeStyles(() =>
    createStyles({
        tabPanelWrapper: {
            display: 'flex',
            flexDirection: 'row'
        },
        libraryTypeSelector: {
            height: '48px',
            width: '60%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end'
        },
        suggestionsInner: {
            overflowY: 'scroll',
            height: '100%',
            width: '102%'
        },
        selectDropDownSe: {
            height: '32px',
            borderRadius: 4,
            background: "linear-gradient(180deg, #FFFFFF 0%, #F7F7F9 100%)",
            boxShadow: "inset 0 0 0 1px #DEE0E7, 0 1px 2px -1px rgba(0,0,0,0.08)",
            cursor: "pointer",
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
        },
        dropdownStyle: {
            boxSizing: "border-box",
            width: "auto",
            border: "1px solid #DEE0E7",
            borderRadius: "5px",
            boxShadow: "0 5px 10px -3px rgba(50,50,77,0.1)",
            color: "#222228",
            marginTop: '0.25rem',
            marginLeft: '4px'
        },
        tabsPanelSe: {
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
                color: '#40404B'
            },
            "& .MuiTabs-indicator": {
                backgroundColor: '#40404B',
                height: '1px'
            },
            "& .MuiTabs-scroller": {
                height: '48px'
            }
        },
        lsSuggestionList: {
            top: '5%',
            height: '95%',
            overflowY: 'scroll',
            overflowX: 'hidden',
            "& .MuiList-padding": {
                ...removePadding
            }
        },
        suggestionList: {
            columnGap: '6%',
            display: 'grid',
            gridTemplateColumns: '47% 47%',
            "& .MuiListItem-root": {
                marginBottom: '8px',
                padding: '0 10px'
            },
        },
        suggestionListItem: {
            "& .MuiListItemText-root": {
                margin: '0'
            },
            ...hoverColor1,
            ...focusColor1
        },
        suggestionDataType: {
            color: '#05A26B',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        suggestionValue: {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        expressionSuggestionList: {
            overflowX: 'hidden',
            width: '100%'
        },
        librarySearchBox: {
            position: 'relative',
            height: '32px',
            width: 'inherit',
            border: '1px #E0E3E9',
            borderRadius: '5px',
            boxShadow: 'inset 0 0 0 1px #DEE0E7, inset 0 2px 1px 0 rgba(0,0,0,0.07), 0 0 0 0 rgba(50,50,77,0.07)',
            color: '#CBCEDB',
            textIndent: '12px',
            textAlign: 'left',
            marginBottom: '16px'
        },
        librarySearchSubHeader: {
            color: '#1D2028',
            marginBottom: '4px',
            fontWeight: 500,
            ...stmtEditorPadding
        },
        expressionList: {
            columnGap: '5%',
            display: 'grid',
            gridTemplateColumns: '30% 30% 30%',
            "& .MuiListItem-root": {
                marginBottom: '8px',
                padding: '0 10px',
                width: 'fit-content'
            },
            ...removePadding
        },
        expressionListItem: {
            width: '100px',
            "& .MuiListItemText-root": {
                margin: '0'
            },
            ...hoverColor1,
            ...focusColor1
        },
        loadingContainer: {
            height: '60vh',
            alignContent: 'center',
            alignItems: 'center',
        },
        libraryBrowser: {
            overflowX: 'hidden',
            "& .MuiListItem-root": {
                padding: '6px 10px'
            },
            "& .MuiIconButton-root": {
                ...removePadding
            }
        },
        libraryBrowserHeader: {
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            alignItems: 'center',
            zIndex: 1,
            ...stmtEditorPadding
        },

        moduleTitle: {
            marginRight: '43px',
            marginLeft: '4.25px',
            marginBottom: '2px',
        },
        libraryReturnIcon: {
            alignSelf: 'center',
            margin: '0 10px 16px 0',
            "& .MuiSvgIcon-root": {
                fontSize: '13px',
            },
            ...hoverColor1,
            ...focusColor1
        },
        arrowBack: {
            color: '#5567D5'
        },
        libraryModuleIcon: {
            marginLeft: '8.25px'
        },
        libraryListBlock: {
            paddingBottom: '8px',
            columnGap: '5%',
            display: 'grid',
            gridTemplateColumns: '28% 28% 28%',
            ...removePadding
        },
        libraryElementBlockContent: {
            top: '10%',
            height: '80%',
            overflowY: 'scroll',
            overflowX: 'hidden',
            columnGap: '6%',
            display: 'grid',
            gridTemplateColumns: '29% 29% 29%'
        },
        libraryElementBlock: {
            top: '5%',
            display: 'flex',
            flexDirection: 'column'
        },
        libraryElementBlockLabel: {
            height: '10%',
            padding: '0 10px'
        },
    }),
);

export const useStatementEditorStyles = makeStyles(() =>
    createStyles({
        mainStatementWrapper: {
            display: 'flex',
            height: 'auto',
            width: 700,
            flexDirection: 'column',
        },
        stmtEditorInnerWrapper: {
            fontSize: '13px',
            fontFamily: 'Gilmer',
            overflowY: 'hidden',
            ...stmtEditorPadding
        },
        statementExpressionWrapper: {
            height: 'auto',
        },
        suggestionsSection: {
            display: 'flex',
            flexDirection: 'column',
            borderBottom: '1px solid #e6e7ec',
            minHeight: '50vh',
            height: '75vh'
        },
        stmtEditorContentWrapper: {
            backgroundColor: '#f9fafc',
            display: 'flex',
            flexDirection: 'column',
            padding: "11px 0px 8px 0px",
            borderBottom: '1px solid #e6e7ec'
        },
        statementExpressionTitle: {
            display: 'flex',
            alignItems: 'center',
            paddingBottom: '15px',
            fontWeight: 500
        },
        statementExpressionContent: {
            fontSize: "15px",
            'user-select': 'none',
            fontFamily: 'Droid sans mono'
        },
        statementBtnWrapper: {
            height: 'auto',
            padding: "15px 15px 17px 0px",
        },
        bottomPane: {
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '10%'
        },
        buttonWrapper: {
            height: 'auto',
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
            zIndex: 100,
        },
        separatorLine: {
            height: '1px',
            opacity: '0.52',
            backgroundColor: '#DCDEE4',
            marginBottom: '25px'
        },
        stmtEditorExpressionWrapper: {
            paddingLeft: '15px',
            paddingRight: '25px',
            fontSize: '13px',
            fontFamily: 'Gilmer',
            overflowY: 'hidden'
        },
        helpText: {
            fontStyle: "italic"
        },
        parameterCheckbox: {
            color: '#2FA86C',
            "& .MuiCheckbox-colorSecondary.Mui-checked": {
                color: "#2FA86C"
            },
            "&$checked": {
                color: "#2FA86C",
                "&:hover": {
                    background: "transparent",
                },
                "& .MuiIconButton-label": {
                    position: "relative",
                    zIndex: 0,
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
        },
        parameterTabCheckBox : {
            root: {
                "&$checked": {
                    color: "rgba(0, 0, 0, 0.54)"
                }
            }
        },
        checked: {},
        disabledCheckbox : {
            color: 'rgba(47,168,108,0.5)',
            "&$checked": {
                color: "rgba(47,168,108,0.5)",
                "&:hover": {
                    background: "transparent",
                },
                "& .MuiIconButton-label": {
                    position: "relative",
                    zIndex: 0,
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
        },
        parameterHeader :  {
            fontSize: '13px',
            color: '#1D2028',
            letterSpacing: '0',
            lineHeight: '14px'
        },
        parameterSeparater : {
            height: '1px',
            width: '616px',
            opacity: '0.52',
            backgroundColor: "#DCDEE4",
            marginLeft: '16px'
        }
    }),
);
