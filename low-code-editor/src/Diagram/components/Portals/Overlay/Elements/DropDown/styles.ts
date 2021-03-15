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

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({

        container: {
            width: 338,
            paddingBottom: 12,
            paddingTop: 24,
            backgroundColor: "#fff",
            borderRadius: 5,
            boxShadow: "0 5px 10px 0 rgba(102, 103, 133, 0.27)",
            zIndex: 2
        },
        closeBtnWrapper: {
            background: 'none',
            color: '#cbcedb',
            border: 0,
            position: 'absolute',
            top: 0,
            right: 0,
            padding: 10,
            cursor: 'pointer',
            outline: 'none',
        },
        closeBtn: {
            fontSize: 16,
            strokeWidth: 1,
            stroke: '#cbcedb',
            opacity: 1,
            fill: '#cbcedb',
        },
        titleWrapper: {
            marginLeft: 24,
            marginRight: 24,
            marginBottom: 11,
            display: "flex",
        },
        title: {
            marginBottom: 12,
            fontSize: 13,
            letterSpacing: 0,
            fontWeight: 500,
            color: "#222228",
        },
        subTitle: {
            height: 10,
            color: "#686b73",
            fontSize: 10,
            letterSpacing: 1,
            textTransform: "uppercase"
        },
        triggerList: {
            // display: "flex",
            marginTop: 18,
        },
        trigger: {
            display: "flex",
            alignItems: "center",
            height: 40,
            // width: 150,
            '&:hover': {
                backgroundColor: '#E6E7EC',
                cursor: "pointer",
                borderRadius: 4
            }
        },
        triggerIcon: {
            width: 20,
            margin: 10,
        },
        triggerLabel: {
            height: 'auto',
            color: "#222228",
            fontSize: 13,
            letterSpacing: 0,
        },
        customWrapper: {
            marginLeft: 24,
            marginRight: 24,
            marginBottom: 11,
            "& .MuiFormControl-marginNormal": {
                margin: '0 !important'
            }
        },
        customFooterWrapper: {
            marginLeft: 24,
            marginRight: 24,
            marginBottom: 11,
            display: "flex",
            justifyContent: "flex-end"
        },
        selectedTriggerBox: {
            width: "100%",
            borderRadius: 5,
            borderColor: theme.palette.secondary.main,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 45,
            padding: "8px 8px 8px 11px"
        },
        selectedTriggerLabel: {
            display: "flex",
            alignItems: "center",
        },
        changeSelectedTrigger: {
            minWidth: "unset",
            padding: 3,
        },
        repoTextBox: {
            width: "100%",
            borderRadius: "5px",
            "&.MuiInputBase-root": {
                height: 45,
            },
            "&.MuiOutlinedInput-input": {
                height: 45,
            },
        },
        saveBtn: {
            // width: "100%",
        },
        linkBtn: {
            marginTop: 12,
            color: theme.palette.primary.main
        },
        radioBtnWrapper: {
            "& .MuiFormGroup-root": {
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
            },
            "& .MuiFormControlLabel-root": {
                width: "48%",
            },
        },
        loader: {
            marginTop: 16,
            marginBottom: 18,
        },
        loaderTitle: {
            textAlign: "center",
        }
    })
);
