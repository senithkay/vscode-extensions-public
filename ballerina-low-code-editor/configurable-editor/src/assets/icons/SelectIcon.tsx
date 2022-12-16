/*
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import React from "react";
import { useStyles } from "./style";

export default function SelectIcon() {
    const classes = useStyles();

    return (
        <svg viewBox="0 0 16 16" className={classes.defaultMainIcon}>
            <path
                data-name="select icon"
                d="M15.362,2.392a3.928,3.928,0,0,1-.352,5.152l-2.777,2.777L10.9,8.988,12.077,7.81a.533.533,0,1,0-.754-.754L10.146,8.233,8.767,6.854,9.944,5.677a.533.533,0,1,0-.754-.754L8.012,6.1,6.679,4.767,9.456,1.99a3.928,3.928,0,0,1,5.152-.352l.982-.982a.533.533,0,1,1,.754.754ZM1.638,14.608l-.982.982a.533.533,0,1,0,.754.754l.982-.982a3.928,3.928,0,0,0,5.152-.352l2.4-2.4.377-.377-.377-.377L8.988,10.9l.956-.956A.533.533,0,0,0,9.19,9.19l-.956.956L6.854,8.767,7.81,7.81a.533.533,0,0,0-.754-.754L6.1,8.012l-.956-.956-.377-.377-.377.377-2.4,2.4A3.928,3.928,0,0,0,1.638,14.608Zm1.106-4.4L4.767,8.188l4.046,4.046L6.79,14.256A2.861,2.861,0,0,1,2.744,10.21Z"
                transform="translate(-0.5 -0.5)"
                fillRule="evenodd"
            />
        </svg>
    );
}
