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
    sectionWrapper: {
        marginBottom: 15,
        "& .MuiFormControl-marginNormal": {
            margin: '0 !important'
        }
    },
    sectionTitle: {
        height: 10,
        color: "#686b73",
        fontSize: 10,
        letterSpacing: 1,
        textTransform: "uppercase",
        margin: "0 0 15px"
    },
});
