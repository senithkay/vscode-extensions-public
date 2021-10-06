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

export const statementEditorStyles = makeStyles(() =>
    createStyles({
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
            paddingTop: '10px'
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
        rightPane: {
            display: 'flex',
            flexDirection: 'column',
            width: '40%',
            height: '100%'
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
            height: '50%',
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
            display: 'flex',
            position: 'relative',
            height: '55%',
            width: '90%',
            top: '5%'
        },
        diagnosticsPane: {
            color: '#ea4c4d',
            display: 'flex',
            height: '5%',
            paddingLeft: '5%'
        },
        suggestionButton: {
            boxSizing: 'border-box',
            height: '29px',
            border: '1px solid #CBCEDB',
            borderRadius: '4px',
            backgroundColor: 'rgba(255,255,255,0.5)',
            minWidth: '70px',
            marginLeft: '2%',
            marginTop: '3%',
            color: '#40404B',
            fontSize: '12px',
            letterSpacing: 0,
            lineHeight: '24px',
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
            color: '#0095FF',
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
            '&:hover': {
                backgroundColor: '#d7dcfc',
                color: '#fff'
            }
        },
        inputEditorTemplate: {
            // color: '#05A26B',
            color: '#5567D5',
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
        shortcutPanel: {
            display: 'flex',
            flexDirection: 'row',
            height: '8%',
            width: '100%'
        },
        shortcutTab: {
            boxSizing: 'border-box',
            height: '100%',
            width: '30%',
            color: '#8D91A3',
            fontSize: '13px',
            letterSpacing: 0,
            lineHeight: '14px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderBottom: '1px solid #DCDEE4'
        },
        shortcutsDivider: {
            height: '1px',
            marginLeft: '5%',
            width: '90%',
            opacity: 0.52,
            backgroundColor: '#DCDEE4'
        }
    }),
);
