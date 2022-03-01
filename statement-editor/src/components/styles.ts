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

export const useStatementEditorStyles = makeStyles(() =>
    createStyles({
        mainStatementWrapper: {
            display: 'flex',
            height: 'auto',
            width: 700,
            flexDirection: 'column',
        },
        statementExpressionWrapper: {
            height: 'auto',
        },
        suggestionsSection: {
            display: 'flex',
            flexDirection: 'column',
            borderBottom: '1px solid #e6e7ec',
            minHeight: '50vh',
            height: '60vh'
        },
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
            textAlignLast: 'center'
        },
        stmtEditorContentWrapper: {
            backgroundColor: '#f9fafc',
            display: 'flex',
            flexDirection: 'column',
            padding: theme.spacing(1.5),
            borderBottom: '1px solid #e6e7ec'
        },
        sugessionsWrapper: {
            width: '100%',
        },
        LibraryBrowsingWrapper: {
            width: '50%',
        },
        statementExpressionTitle: {
            paddingTop: theme.spacing(1.5),
            paddingBottom: theme.spacing(1),
        },
        statementExpressionContent: {
            paddingTop: theme.spacing(1.5),
            paddingBottom: theme.spacing(1),
        },
        expressionSugession: {
            padding: theme.spacing(1.5),
        },
        statementBtnWrapper: {
            height: 'auto',
            padding: theme.spacing(1.5),
        },
        stmtEditor: {
            display: "flex",
            flexDirection: 'column',
            backgroundColor: '#fff',
            width: 700,
            height: 700
        },
        titleLine: {
            height: '1px',
            width: 700,
            opacity: 0.43,
            backgroundColor: '#D8D8D8',
        },
        leftPaneDivider: {
            height: '1px',
            width: '393px',
            opacity: 0.43,
            backgroundColor: '#D8D8D8'
        },
        subHeader: {
            height: '14px',
            width: '146px',
            color: '#1D2028',
            fontFamily: 'Gilmer,sans-serif',
            fontSize: '13px',
            letterSpacing: 0,
            lineHeight: '14px',
            paddingTop: '10px',
            paddingBottom: '15px'
        },
        codeLine: {
            height: '24px',
            width: '15px',
            color: '#0095FF',
            fontFamily: "Droid Sans Mono",
            fontSize: '12px',
            letterSpacing: 0,
            lineHeight: '24px',
        },
        vl: {
            borderLeft: '1px solid #E6E7EC',
            height: '100%',
            left: '60%',
            marginLeft: '-3px',
            top: '2%',
            bottom: '10%'
        },
        libraryBrowser: {
            display: 'flex',
            flexDirection: 'column',
            width: 'auto%',
            height: '100%',
            position: 'relative',
            top: '10px',
            marginLeft: '5%'
        },
        leftPane: {
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#fff',
            width: '60%',
            height: '100%'
        },
        contentPane: {
            display: 'flex',
            flexDirection: 'row',
            backgroundColor: '#fff',
            width: '100%',
            height: '90%'
        },
        bottomPane: {
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#fff',
            width: '100%',
            height: '10%'
        },
        rightPaneBlock: {
            // backgroundColor: '#00ff00',
            display: 'flex',
            position: 'relative',
            // left: '5%',
            height: '30%',
            width: '100%'
        },
        templateEditor: {
            position: 'relative',
            height: '30%',
            width: '95%',
            display: 'flex'
        },
        templateEditorInner: {
            position: 'relative',
            top: '12%',
            height: '93%',
            width: '100%',
            overflowY: 'scroll'
        },
        suggestionsInner: {
            overflowY: 'scroll',
            padding: theme.spacing(1.5)
        },
        contextSensitivePane: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            position: 'relative',
            marginLeft: '5%'
        },
        diagnosticsPane: {
            color: '#ea4c4d',
            display: 'flex',
            height: '5%',
            paddingLeft: '5%'
        },
        suggestionButton: {
            boxSizing: 'border-box',
            border: '1px solid #CBCEDB',
            borderRadius: '4px',
            fontFamily: 'inherit',
            backgroundColor: 'rgba(255,255,255,0.5)',
            marginLeft: '2%',
            marginTop: '3%',
            color: '#40404B',
            fontSize: 12,
            padding: '5px 10px',
            letterSpacing: 0,
            '&:hover': {
                backgroundColor: '#8e9bdc',
                color: 'white'
            },
            '&:disabled': {
                backgroundColor: 'rgba(0,0,0,0.1)',
                color: '#404040',
            }
        },
        expressionBlock: {
            position: 'relative',
            paddingRight: '10px'
        },
        expressionBlockDisabled: {
            height: '24px',
            width: '15px',
            fontFamily: "Droid Sans Mono",
            fontSize: '12px',
            letterSpacing: 0,
            lineHeight: '24px',
        },
        expressionElement: {
            boxSizing: 'border-box',
            border: '1px solid #A6B3FF',
            borderRadius: '8px',
            position: 'relative',
            width: 'fit-content',
            backgroundColor: '#ffffff',
            marginLeft: '2px',
            marginTop: '1px',
            fontFamily: "Droid Sans Mono",
            color: '#0095FF',
            fontSize: '12px',
            letterSpacing: 0,
            lineHeight: '24px',
            '& .expressionElementCloseButton': {
                display: 'none',
                boxSizing: 'border-box',
                border: '1px solid #A6B3FF',
                borderRadius: '2px',
                position: 'relative',
                width: '10px',
                backgroundColor: '#000000',
                color: '#ffffff',
                fontSize: '7px',
                '&:hover': {
                    backgroundColor: '#00ff00',
                    color: '#fff'
                }
            },
            '&:hover': {
                backgroundColor: '#d7dcfc',
                color: '#fff',
                "& .expressionElementCloseButton": {
                    display: 'inline',
                }
            }
        },
        expressionElementSelected: {
            backgroundColor: '#5567D5',
            color: '#fff',
            border: '1px solid #5567D5',
        },
        inputEditorTemplate: {
            minWidth: '20px',
            fontSize: '13px',
            letterSpacing: 0,
            display: 'inline-block',
            lineHeight: '24px',
            position: 'relative',
            marginLeft: '2px',
            marginTop: '1px',
            borderRadius: '5px',
            border: '1px',
            '&:hover': {
                backgroundColor: '#d7dcfc',
                color: '#fff'
            },
            '&:focus': {
                outline: 'none'
            }
        },
        addNewExpressionButton: {
            backgroundColor: '#f7f8fb',
            border: '#6830e9',
            borderStyle: 'solid',
            color: '#6830e9',
            textAlign: 'center',
            fontSize: '16px',
            margin: '4px 2px',
            borderRadius: '50%'
        },
        libraryBrowserHeader: {
            display: 'flex',
            flexDirection: 'row',
            width: '96%'
        },
        libraryDropdown: {
            flex: '0 0 50%',
            display: 'flex',
            justifyContent: 'flex-end'
        },
        rhsComponent: {
            position: 'relative',
            top: '10px',
            width: '90%',
            marginLeft: '5%'
        },
        propertyDivider: {
            height: '1px',
            marginLeft: '2%',
            marginTop: '2%',
            width: '94%',
            opacity: 0.52,
            backgroundColor: '#DCDEE4'
        },
        buttonWrapper: {
            height: 'auto',
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
            zIndex: 100,
        },
        plusIconBorder: {
            boxSizing: 'border-box',
            border: '1px dashed #A6B3FF',
            borderRadius: '4px',
            position: 'relative',
            width: 'fit-content',
            backgroundColor: '#F0F1FB',
            fontFamily: "Droid Sans Mono",
            color: '#0095FF',
            marginLeft: '2px',
            fontSize: '12px',
            '&:hover': {
                backgroundColor: '#5567D5',
                color: '#fff'
            }
        },
        mainExpStatementWrapper: {
            display: 'flex',
            flexDirection: 'row'
        },
        expressionComponent: {
            display: 'flex',
            flexDirection: 'row'
        },
        libraryBlock: {
            position: 'relative',
            height: '40vh',
            overflowY: 'scroll',
            overflowX: 'hidden'
        },
        librarySearchBox: {
            position: 'relative',
            height: '32px',
            width: '304px',
            border: '1px #E0E3E9',
            borderRadius: '5px',
            backgroundColor: '#FFFFFF',
            boxShadow: 'inset 0 0 0 1px #DEE0E7, inset 0 2px 1px 0 rgba(0,0,0,0.07), 0 0 0 0 rgba(50,50,77,0.07)',
            color: '#CBCEDB',
            textIndent: '5px'
        },
        libraryResourceButton: {
            boxSizing: 'border-box',
            border: '1px solid #CBCEDB',
            borderRadius: '4px',
            fontFamily: 'inherit',
            backgroundColor: 'rgba(255,255,255,0.5)',
            marginLeft: '2%',
            marginTop: '3%',
            color: '#40404B',
            fontSize: 11,
            padding: '5px 10px',
            letterSpacing: 0,
            '&:hover': {
                backgroundColor: '#8e9bdc',
                color: 'white'
            },
            '&:disabled': {
                backgroundColor: 'rgba(0,0,0,0.1)',
                color: '#404040',
            }
        },
        librarySearchSubHeader: {
            height: '12px',
            color: '#1D2028',
            fontFamily: 'Gilmer,sans-serif',
            fontSize: '11px',
            letterSpacing: 0,
            lineHeight: '12px',
            paddingTop: '10px',
            paddingBottom: '10px'
        },
        libraryElementBlock: {
            position: 'relative',
            top: '5%',
            maxHeight: '20vh',
            display: 'flex',
            flexDirection: 'column',
        },
        libraryElementBlockLabel: {
            height: '10%',
        },
        libraryElementBlockContent: {
            top: '10%',
            height: '80%',
            overflowY: 'scroll',
            overflowX: 'hidden'
        },
        libraryListButton: {
            border: 'none',
            backgroundColor: '#FFF',
            color: '#5567D5',
            '&:hover': {
                color: '#3a479c'
            },
        },
        lsSuggestionList: {
            top: '5%',
            height: '70%',
            overflowY: 'scroll',
            overflowX: 'hidden',
        },
        expressionSuggestionList: {
            maxHeight: '100%',
            overflowY: 'scroll',
            overflowX: 'hidden',
        },
        suggestionListItem: {
            padding: '0px',
            '&:hover': {
                backgroundColor: '#8e9bdc',
                color: 'white'
            }
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
        suggestionList: {
            columnGap: '6%',
            display: 'grid',
            gridTemplateColumns: '47% 47%'
        },
        selectDropDownSe: {
            height: '30px',
            width: "auto",
            borderRadius: 5,
            background: "linear-gradient(180deg, #ffffff 0%, #f7f7f9 100%)",
            boxShadow: "inset 0 0 0 1px #dee0e7, 0 1px 1px 0 rgba(0, 0, 0, 0.06)",
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
                marginRight: 20,
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
                padding: "0 15px",
                minWidth: "100px"
            },
            "& .MuiSelect-select.MuiSelect-select:focus": {
                backgroundColor: "none"
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
        },
        tabsPanelPaperSe: {
            flexGrow: 1,
            boxShadow: 'none'
        },
        tabsPanelSe: {
            "& .MuiTab-wrapper": {
                textTransform: 'none',
                fontSize: '13px',
                fontWeight: 'normal'
            },
            "& .MuiTab-textColorPrimary.Mui-selected": {
                color: '#1D2028'
            },
            "& .MuiTab-textColorPrimary": {
                color: '#8D91A3'
            },
            "& .MuiTabs-indicator": {
                backgroundColor: '#40404B',
                height: '1px'
            },
            "& .MuiTabs-scroller": {
                height: '48px'
            }
        },
        noSuggestionText: {
            fontSize: '12px',
            fontWeight: 'normal',
            padding: theme.spacing(1.5)
        },
    }),
);
