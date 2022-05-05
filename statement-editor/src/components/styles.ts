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
            right: '13px',
            top: '60px',
            border: '1px solid #e6e7ec',
            borderRadius: '8px',
            marginLeft: '30px',
            backgroundColor: '#ffffff'
        },
        toolbarIcons: {
            padding: '5px',
            '&:hover': {
                backgroundColor: '#F0F1FB',
            }
        },
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
                backgroundColor: '#b3d9ff',
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
            fontSize: '12px',
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
            "& .MuiList-padding": {
                padding: '0px'
            },
            "& .MuiListItemText-root": {
                margin: '0px'
            }
        },
    }),
);

export const useStmtEditorHelperPanelStyles = makeStyles(() =>
    createStyles({
        tabPanelWrapper: {
            width: 'auto',
            height: '48px',
            boxShadow: '0px 1px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)',
            display: 'flex',
            flexDirection: 'row'
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
            height: '100%',
            paddingTop: '16px',
        },
        selectDropDownSe: {
            height: '32px',
            width: "auto",
            borderRadius: 4,
            fontSize: "12px",
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
                fontSize: '13px',
                fontWeight: 'normal'
            },
            "& .MuiTab-root": {
                marginRight: '24px',
                paddingRight: '0px',
                paddingLeft: '0px',
                fontSize: '13px',
                minWidth: 'fit-content'
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
        noSuggestionText: {
            fontSize: '12px',
            fontWeight: 'normal',
            padding: theme.spacing(1.5)
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
            fontSize: '12px',
            textAlign: 'left',
            paddingLeft: '12px',
            marginRight: '10px',
            marginBottom: '16px'
        },
        librarySearchSubHeader: {
            height: '12px',
            color: '#1D2028',
            fontFamily: 'Gilmer,sans-serif',
            fontSize: '13px',
            letterSpacing: 0,
            lineHeight: '14px',
            margin: '0px'
        },
        expressionList: {
            columnGap: '6%',
            display: 'grid',
            gridTemplateColumns: '47% 47%',
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
            fontSize: '13px'
        },
        libraryReturnIcon: {
            padding: '0px',
            '&:hover': {
                backgroundColor: '#F0F1FB',
            },
            '&:focus': {
                backgroundColor: 'rgba(204,209,242,0.61)'
            }
        },
        arrowBack: {
            fontSize: '17px',
            lineHeight: '24px',
            color: '#5567D5'
        },
        libraryModuleIcon: {
            marginLeft: '8.25px'
        },
        libraryListBlock: {
            paddingRight: '5px',
            paddingBottom: '8px',
            columnGap: '6%',
            display: 'grid',
            gridTemplateColumns: '47% 47%',
            padding: '0px',
            "& .MuiListItem-root": {
                margin: '0 0 8px 0',
                padding: '0'
            },
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
            flexDirection: 'column',
            paddingBottom: '25px'
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
            padding: "18px 0px 34px 0px",
            borderBottom: '1px solid #e6e7ec'
        },
        statementExpressionTitle: {
            display: 'flex',
            alignItems: 'center',
            paddingBottom: '20px',
        },
        statementExpressionContent: {
            fontSize: "18px",
            'user-select': 'none'
        },
        statementBtnWrapper: {
            height: 'auto',
            padding: theme.spacing(1.5),
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
    }),
);
