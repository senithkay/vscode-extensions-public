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

export const useStatementEditorToolbarStyles = makeStyles(() =>
    createStyles({
        toolbar: {
            display: 'flex',
            flexDirection: 'row',
            marginLeft: '15px'
        },
        toolbarSet: {
            border: '1px solid #e6e7ec',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'row',
            marginRight: '16px'
        },
        toolbarIcons: {
            padding: '8px',
            '&:hover': {
                backgroundColor: '#F0F1FB',
            }
        },
        undoRedoSeparator: {
            height: '32px',
            width: '1px',
            borderRadius: '5px',
            backgroundColor: '#FFFFFF',
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
            margin: '0 2px 0 0',
            '&': {
                width: 'fit-content',
                borderRadius: '4px',
            },
            '&.hovered': {
                backgroundColor: '#e5ebf1'
            },
            cursor: "pointer",
            ...syntaxHighlightingRules
        },
        expressionElementSelected: {
            '&': {
                backgroundColor: '#ccd1f29c',
            },
            '&.hovered': {
                backgroundColor: '#e5ebf1',
            },
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
                padding: '0px'
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
            width: 'auto',
            height: '48px',
            // boxShadow: '0px 1px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)',
            display: 'flex',
            flexDirection: 'row',
            marginRight: '20px'
        },
        tabPanel: {
            width: '70%'
        },
        libraryTypeSelector: {
            width: '30%',
            height: '48px',
            padding: '9px',
            textAlignLast: 'right'
        },
        suggestionsInner: {
            overflowY: 'scroll',
            height: '100%'
        },
        selectDropDownSe: {
            height: '32px',
            width: "auto",
            borderRadius: 4,
            color: '#222228',
            background: "linear-gradient(180deg, #FFFFFF 0%, #F7F7F9 100%)",
            boxShadow: "inset 0 0 0 1px #DEE0E7, 0 1px 2px -1px rgba(0,0,0,0.08)",
            cursor: "pointer",
            marginBottom: theme.spacing(2.5),
            border: 1,
            "&:active": {
                background: "linear-gradient(180deg, #ffffff 0%, #f7f7f9 100%)",
                boxShadow: "inset 0 0 0 1px #a6b3ff, 0 1px 1px 0 rgba(0, 0, 0, 0.06)",
                border: "1px solid #5567d5",
            },
            "&:focused": {
                background: "linear-gradient(180deg, #ffffff 0%, #f7f7f9 100%)",
                boxShadow: "inset 0 0 0 1px #a6b3ff, 0 1px 1px 0 rgba(0, 0, 0, 0.06)",
                border: "1px solid #5567d5 !important",
                backgroundColor: "none"
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
            backgroundColor: "#fff",
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
                paddingRight: '0px',
                paddingLeft: '0px',
                minWidth: 'fit-content',
                fontSize: '13px'
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
                padding: '0'
            }
        },
        suggestionList: {
            columnGap: '6%',
            display: 'grid',
            gridTemplateColumns: '47% 47%',
            "& .MuiListItem-root": {
                margin: '0 0 8px 0',
                padding: '0'
            },
        },
        suggestionListItem: {
            '&:hover': {
                backgroundColor: '#F0F1FB',
            },
            '&:focus': {
                backgroundColor: 'rgba(204,209,242,0.61)'
            },
            "& .MuiListItemText-root": {
                margin: '0'
            },
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
            maxHeight: '100%',
            overflowY: 'scroll',
            overflowX: 'hidden',
            width: '100%'
        },
        librarySearchBox: {
            position: 'relative',
            height: '32px',
            width: 'inherit',
            border: '1px #E0E3E9',
            borderRadius: '5px',
            backgroundColor: '#FFFFFF',
            boxShadow: 'inset 0 0 0 1px #DEE0E7, inset 0 2px 1px 0 rgba(0,0,0,0.07), 0 0 0 0 rgba(50,50,77,0.07)',
            color: '#CBCEDB',
            textIndent: '12px',
            textAlign: 'left',
            paddingLeft: '12px',
            marginRight: '10px',
            marginBottom: '16px'
        },
        librarySearchSubHeader: {
            color: '#1D2028',
            margin: '0 0 4px 0',
            fontWeight: 500
        },
        expressionList: {
            columnGap: '5%',
            display: 'grid',
            gridTemplateColumns: '28% 28% 28%',
            padding: 0,
            "& .MuiListItem-root": {
                margin: '0 0 8px 0',
                padding: '0'
            },
        },
        loadingContainer: {
            height: '60vh',
            alignContent: 'center',
            alignItems: 'center',
        },
        libraryBrowser: {
            height: '100%',
            overflowY: 'scroll',
            overflowX: 'hidden',
            "& .MuiListItem-root": {
                padding: '6px 0 6px 0'
            },
            "& .MuiIconButton-root": {
                padding: '0'
            }
        },
        libraryBrowserHeader: {
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            alignItems: 'center',
            position: 'sticky',
            top: '0px',
            zIndex: 1,
            backgroundColor: '#FFFFFF'
        },

        moduleTitle: {
            marginRight: '43px',
            marginLeft: '4.25px',
            marginBottom: '2px',
        },
        libraryReturnIcon: {
            alignSelf: 'center',
            '&:hover': {
                backgroundColor: '#F0F1FB',
            },
            '&:focus': {
                backgroundColor: 'rgba(204,209,242,0.61)'
            },
            margin: '0 10px 16px 0',
            "& .MuiSvgIcon-root": {
                fontSize: '13px',
            }
        },
        arrowBack: {
            color: '#5567D5'
        },
        libraryModuleIcon: {
            marginLeft: '8.25px'
        },
        libraryListBlock: {
            paddingRight: '5px',
            paddingBottom: '8px',
            columnGap: '5%',
            display: 'grid',
            gridTemplateColumns: '28% 28% 28%',
            padding: '0px',
        },
        libraryElementBlockContent: {
            padding: '0px',
            top: '10%',
            height: '80%',
            overflowY: 'scroll',
            overflowX: 'hidden',
            columnGap: '6%',
            display: 'grid',
            gridTemplateColumns: '29% 29% 29%',
            paddingBottom: '8px'
        },
        libraryElementBlock: {
            top: '5%',
            display: 'flex',
            flexDirection: 'column'
        },
        libraryElementBlockLabel: {
            height: '10%',
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
            paddingLeft: '25px',
            fontSize: '13px',
            fontFamily: 'Gilmer'
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
        statementExpressionName: {
            marginRight: '400px'
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
            backgroundColor: '#fff',
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
            width: '645px',
            opacity: '0.52',
            backgroundColor: '#DCDEE4',
            marginBottom: '15px'
        }
    }),
);
