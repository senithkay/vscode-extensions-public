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
import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles({
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
    radioBtn: {
        border: "1px solid #8D91A3",
        borderRadius: "4px",
        backgroundColor: "#ffffff",
        letterSpacing: 0,
        lineHeight: "14px",
        fontSize: "11px",
        color: "#8D91A3",
        padding: "4px 12px",
        margin: "0 6px 0 0",
        outline: "none",
        cursor: "pointer"
    },
    radioSelected: {
        backgroundColor: "#0095FF",
        color: "#ffffff"
    }
});
