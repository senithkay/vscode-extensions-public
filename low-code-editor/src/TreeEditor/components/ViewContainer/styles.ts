/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import {createStyles, makeStyles} from '@material-ui/core/styles';

export const statementEditorStyles = makeStyles(() =>
    createStyles({
        App: {
            display: "flex",
            backgroundColor: '#fff',
            width: '100%',
            height: '100%'
        },
        vl: {
            borderLeft: '3px solid #959ee1',
            height: '80%',
            position: 'absolute',
            left: '60%',
            marginLeft: '-3px',
            top: '2%'
        },
        AppRightPane: {
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#f7f8fb',
            width: '40%',
            height: '100%'
        },
        AppLeftPane: {
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#fff',
            width: '60%',
            height: '100%'
        },
        AppRightPaneBlock: {
            backgroundColor: '#fff',
            display: 'flex',
            position: 'relative',
            left: '5%',
            height: '25%',
            width: '100%'
        },
        AppRightPaneHeading: {
            fontFamily: 'Gilmer,sans-serif',
            marginLeft: '5px'
        },
        AppLeftPaneHeading: {
            fontFamily: 'Gilmer,sans-serif',
            textAlign: 'left'
        },
        AppStatementTemplateEditor: {
            position: 'relative',
            height: '30%',
            width: '90%',
            // backgroundColor: '#f7f8fb',
            borderColor: '#959ee1',
            borderRadius: '20px',
            borderStyle: 'solid',
            display: 'flex'
        },
        AppStatementTemplateEditorInner: {
            position: 'relative',
            left: '5%',
            top: '5%',
            height: '93%',
            width: '93%'
            // overflow: 'scroll'
        },
        AppContextSensitivePane: {
            // backgroundColor: '#f7f8fb',
            borderColor: '#b9bac1',
            borderRadius: '20px',
            borderStyle: 'solid',
            display: 'flex',
            position: 'relative',
            top: '5%',
            height: '60%',
            width: '90%',
        }
    }),
);
