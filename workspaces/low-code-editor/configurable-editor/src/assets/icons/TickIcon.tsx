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

export default function TickIcon() {
    const classes = useStyles();

    return (
        <svg viewBox="0 0 16 16" className={classes.defaultMainIcon}>
           <path d="M13.6796 4.46967C13.9725 4.17678 14.4474 4.17678 14.7403 4.46967C15.0066 4.73594 15.0308 5.1526 14.8129 5.44621L14.7403 5.53033L7.20996 13.0607L2.67963 8.53033C2.38674 8.23744 2.38674 7.76256 2.67963 7.46967C2.9459 7.2034 3.36256 7.1792 3.65617 7.39705L3.74029 7.46967L7.20996 10.939L13.6796 4.46967Z" fill="currentColor"/>
        </svg>
    );
}
