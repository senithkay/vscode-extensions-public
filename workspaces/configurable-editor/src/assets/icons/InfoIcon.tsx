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

export default function InfoIcon() {
  const classes = useStyles();

  return (
    <svg viewBox="0 0 16 16" className={classes.defaultMainIcon}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16
        8 16C3.58172 16 0 12.4183 0 8ZM15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1
        8C1 11.866 4.13401 15 8 15C11.866 15 15 11.866 15 8ZM8 3C8.55229 3 9 3.44772 9
        4C9 4.55228 8.55229 5 8 5C7.44772 5 7 4.55228 7 4C7 3.44772 7.44772 3 8 3ZM8.73792
        7.15376C8.67441 6.80389 8.36819 6.53857 8 6.53857C7.58579 6.53857 7.25 6.87436 7.25
        7.28857V12.2509L7.26208 12.3858C7.32559 12.7356 7.63181 13.0009 8 13.0009C8.41421
        13.0009 8.75 12.6652 8.75 12.2509V7.28857L8.73792 7.15376Z"
        fill="current-color"
      />
    </svg>
  );
}
