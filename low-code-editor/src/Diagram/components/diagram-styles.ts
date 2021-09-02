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
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        moduleVariableContainer: {
            borderColor: `#E6E7EC`,
            borderRadius: 6,
            borderStyle: "solid",
            borderWidth: 1,
            background: `#FFFFFF`
        },
        moduleVariableWrapper: {
            display: `flex`,
            flexDirection: `row`,
        },
        moduleVariableIcon: {
            height: 18,
            width: 18,
            // backgroundColor: `#40404B`,
            backgroundColor: `red`,
            margin: '15.5px 12px 15.5px 14.5px',
        },
        moduleVariableTypeText: {
            height: 24,
            width: 60,
            margin: '10.5px 0 14.5px 0',
            fontFamily: `inherit`,
            fontSize: 13,
            letterSpacing: 0,
            color: `#222228`,
            lineHeight: `24px`
        },
        moduleVariableNameText: {
            height: 24,
            width: 104,
            margin: '10.5px 0 14.5px 0',
            fontFamily: `inherit`,
            fontSize: 13,
            letterSpacing: 0,
            color: `#8D91A3`,
            lineHeight: `24px`
        },
        editBtnWrapper: {
            cursor: "pointer",
            marginTop: 15,
        },
        deleteBtnWrapper: {
            cursor: "pointer",
            marginTop: 15,
            marginLeft: 20,
            zIndex: 1
        }
    })
);
