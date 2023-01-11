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

export default function DeleteIcon() {
  const classes = useStyles();

  return (
    <svg viewBox="0 0 16 16" className={classes.defaultMainIcon}>
        <path fillRule="evenodd" clipRule="evenodd" d="M10.0002 3H12.0002H13.0002V4H12.0002V13L11.0002 14H4.00024L3.00024 13V4H2.00024V3H5.00024V2C5.00024 1.73478 5.10555 1.48038 5.29309 1.29285C5.48063 1.10531 5.73503 1 6.00024 1H9.00024C9.26546 1 9.51986 1.10531 9.7074 1.29285C9.89493 1.48038 10.0002 1.73478 10.0002 2V3ZM9.00024 2H6.00024V3H9.00024V2ZM4.00024 13H11.0002V4H4.00024V13ZM6.00024 5H5.00024V12H6.00024V5ZM7.00024 5H8.00024V12H7.00024V5ZM9.00024 5H10.0002V12H9.00024V5Z" fill="currentColor"/>
    </svg>
  );
}
