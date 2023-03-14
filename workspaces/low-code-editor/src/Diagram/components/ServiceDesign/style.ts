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
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { theme } from '@wso2-enterprise/ballerina-low-code-edtior-commons';

export const useStyles = makeStyles(() =>
    createStyles({
        root: {
            flexGrow: 1,
            height: "100%",
            overflow: "hidden"
        },
        plusButton: {
            marginLeft: 18
        },
        headerContainer: {
            width: "100%",
            // height: 50,
            display: "flex",
            padding: 15,
            backgroundColor: "white",
            alignItems: "center",
            borderBottom: "1px solid rgba(102,103,133,0.15)"
        },
        homeButton: {
            cursor: "pointer",
            marginRight: 10
        },
        closeButton: {
            cursor: "pointer",
        },
        title: {
            fontWeight: 600,
            marginRight: 10
        },
        configurationButton: {
            "& :hover": {
                background: "#e5e6ea",
                cursor: "pointer"
            },
            boxSizing: "border-box",
            padding: "4px 16px 4px 10px",
            background: "#F7F8FB",
            border: "1px solid #E0E2E9",
            boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
            borderRadius: 5,
            display: "inline-flex",
            color: "#40404B",
            alignItems: "center",
            position: "absolute",
            right: 15,
        },
        confBtnText: {
            fontWeight: 400,
            fontSize: 13,
            lineHeight: 24,
            marginLeft: 5,
        },
        breadCrumb: {
            width: "100%",
            display: "flex"
        },
        resourceMethodPathWrapper: {
            display: 'flex',
            flexDirection: 'row',
            padding: '15px 5px'
        },
        methodTypeContainer: {
            display: 'block',
            width: '35%',
        },
        resourcePathWrapper: {
            width: '63%',
            marginLeft: theme.spacing(1.25)
        },
        advancedToggleWrapper: {
            width: '10%',
            marginTop: 32
        },
        plusIconWrapper: {
            height: 16,
            width: 16,
            marginTop: 5
        },
        wizardFormControlExtended: {
            width: 600,
            "& .MuiFormControl-marginNormal": {
                margin: '0 !important',
            },
        },
        resourceWrapper: {
            marginBottom: "15px",
            padding: "5px 0"
        },
        serviceList: {
            overflowY: "scroll",
            maxHeight: "90%"
        },
        expandAll: {
            textAlign: "right"
        },
        collapseBtn: {
            display: "inline-flex",
            border: "1px solid #5667d5",
            borderRadius: 5,
            paddingLeft: 15,
            marginTop: 5,
            marginRight: 20,
            cursor: "pointer"
        },
        signature: {
            padding: 8,
            fontWeight: 500,
            borderRadius: 5
        },
        responseTable: {
            width: "100%",
            "& thead td": {
                borderBottom: "1px solid rgba(59,65,81,.2)",
                color: "#3b4151",
                fontWeight: 700,
                padding: 12,
                textAlign: "left"
            },
            "& tr td": {
                color: "#3b4151",
                padding: 12,
                textAlign: "left"
            },
        },
        schema: {
            background: "#f3efef",
            padding: 16,
        },
        schemaButton: {
            cursor: "pointer",
            fontWeight: 900
        },
        recordEdit: {
            textAlign: "end",
            marginTop: -35,
            cursor: "pointer"
        },
        editButton: {
            paddingRight: 16,
            cursor: "pointer"
        },
        serviceTitle: {
            padding: 10,
            display: "flex",
            justifyContent: "center",
            flexDirection: "row",
            height: 40,
            width: "100%",
            boxShadow: "inset 0 -1px 0 0 #E6E7EC",
            backgroundColor: "#F7F8FB",
            alignItems: "center"
        },
        serviceTitleText: {
            flexGrow: 1,
        },
        serviceConfigure: {
            display: "flex",
            marginLeft: 5,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 4,
            padding: 5,
            backgroundColor: "#5567d5",
            color: "white",
            "& #config-showed-options": {
                fill: "white",
            },
            "& :hover": {
                cursor: "pointer"
            }
        },
        navigationIcon: {
            display: "flex",
            margin: "0 5px",
            justifyContent: "center",
            alignItems: "center",
        },
        servicePath: {
            fontSize: 20,
            fontWeight: 400
        },
        listenerText: {
            fontSize: 15,
            fontWeight: 200
        },
        addResource: {
            height: '30px !important',
        }
    }),
);
