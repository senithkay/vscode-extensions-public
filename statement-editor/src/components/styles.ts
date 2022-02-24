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
        sugessionsSection: {
            display: 'flex',
            borderBottom: '1px solid #e6e7ec',
            minHeight: '50vh',
            height: '60vh'
        },
        sugessionsMainWrapper: {
            backgroundColor: '#f9fafc',
            display: 'flex',
            flexDirection: 'column',
            padding: theme.spacing(1.5),
            borderBottom: '1px solid #e6e7ec'
        },
        sugessionsWrapper: {
            // TODO: when tab view is merged, make width 100% and remove padding and borderRight styles
            width: '50%',
            padding: theme.spacing(1.5),
            borderRight: '1px solid #e6e7ec'
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
        LibraryBrowser: {
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
        contextSensitivePane: {
            // TODO: when tab view is merged, remove width, marginRight and paddingRight
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            position: 'relative',
            marginLeft: '5%',
            marginRight: '5%',
            paddingRight: '12px'
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
            '&:hover': {
                backgroundColor: '#d7dcfc',
                color: '#fff'
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
            '&:hover': {
                backgroundColor: '#d7dcfc',
                color: '#fff'
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
        LibraryDropdown: {
            display: 'flex',
            flexDirection: 'row'
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
            top: '5%',
            height: '75%',
            overflowY: 'scroll',
            overflowX: 'hidden'
        },
        librarySearchBox: {
            position: 'relative',
            top: '5%',
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
            top: '5%',
            height: '20%',
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
            // TODO: when the tab view is merged uncomment these styles
            // columnGap: '6%',
            // display: 'grid',
            // gridTemplateColumns: '47% 47%'
        }
    }),
);
